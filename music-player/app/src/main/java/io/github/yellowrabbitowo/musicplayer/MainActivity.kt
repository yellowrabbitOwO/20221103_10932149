package io.github.yellowrabbitowo.musicplayer

import android.Manifest
import android.content.ComponentName
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.SeekBar
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.widget.doAfterTextChanged
import androidx.lifecycle.lifecycleScope
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.color.MaterialColors
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var folderSpinner: Spinner
    private lateinit var searchInput: EditText
    private lateinit var songList: RecyclerView
    private lateinit var emptyContainer: View
    private lateinit var emptyText: TextView
    private lateinit var permissionButton: Button
    private lateinit var artwork: ImageView
    private lateinit var nowTitle: TextView
    private lateinit var nowArtist: TextView
    private lateinit var positionText: TextView
    private lateinit var durationText: TextView
    private lateinit var seekBar: SeekBar
    private lateinit var shuffleButton: ImageButton
    private lateinit var playButton: ImageButton
    private lateinit var repeatButton: ImageButton

    private val adapter = SongAdapter { position -> playFrom(position) }
    private var allSongs: List<Song> = emptyList()
    private var visibleSongs: List<Song> = emptyList()
    /** 下拉選單的資料夾；第一個 null 代表「全部歌曲」。 */
    private var folderOptions: List<String?> = listOf(null)
    private var selectedFolder: String? = null
    private var scanned = false

    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller: MediaController? = null
    private var userSeeking = false

    private val handler = Handler(Looper.getMainLooper())
    private val progressUpdater = object : Runnable {
        override fun run() {
            updateProgress()
            handler.postDelayed(this, 500)
        }
    }

    private val prefs by lazy { getSharedPreferences("settings", MODE_PRIVATE) }

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
            refreshLibrary()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        bindViews()

        // Android 15 強制全螢幕，避開狀態列與導覽列
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.root)) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        selectedFolder = prefs.getString(KEY_FOLDER, null)

        songList.layoutManager = LinearLayoutManager(this)
        songList.adapter = adapter

        searchInput.doAfterTextChanged { applyFilter() }
        searchInput.setOnEditorActionListener { v, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                getSystemService(InputMethodManager::class.java)
                    .hideSoftInputFromWindow(v.windowToken, 0)
                true
            } else false
        }

        folderSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val folder = folderOptions.getOrNull(position)
                if (folder != selectedFolder) {
                    selectedFolder = folder
                    prefs.edit().putString(KEY_FOLDER, folder).apply()
                    applyFilter()
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) = Unit
        }

        permissionButton.setOnClickListener { permissionLauncher.launch(requiredPermissions()) }

        setupPlayerControls()

        if (hasAudioPermission()) refreshLibrary() else permissionLauncher.launch(requiredPermissions())
    }

    override fun onStart() {
        super.onStart()
        val token = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        val future = MediaController.Builder(this, token).buildAsync()
        controllerFuture = future
        future.addListener({
            if (controllerFuture !== future || future.isCancelled) return@addListener
            val c = runCatching { future.get() }.getOrNull() ?: return@addListener
            controller = c
            c.addListener(playerListener)
            updatePlayerUi()
            updateArtwork(c.mediaMetadata)
        }, MoreExecutors.directExecutor())
        handler.post(progressUpdater)
    }

    override fun onResume() {
        super.onResume()
        // 回到 App 時重新整理，抓到新放進手機的歌
        if (scanned && hasAudioPermission()) refreshLibrary()
    }

    override fun onStop() {
        handler.removeCallbacks(progressUpdater)
        controller?.removeListener(playerListener)
        controller = null
        controllerFuture?.let { MediaController.releaseFuture(it) }
        controllerFuture = null
        super.onStop()
    }

    private fun bindViews() {
        folderSpinner = findViewById(R.id.folderSpinner)
        searchInput = findViewById(R.id.searchInput)
        songList = findViewById(R.id.songList)
        emptyContainer = findViewById(R.id.emptyContainer)
        emptyText = findViewById(R.id.emptyText)
        permissionButton = findViewById(R.id.permissionButton)
        artwork = findViewById(R.id.artwork)
        nowTitle = findViewById(R.id.nowTitle)
        nowArtist = findViewById(R.id.nowArtist)
        positionText = findViewById(R.id.positionText)
        durationText = findViewById(R.id.durationText)
        seekBar = findViewById(R.id.seekBar)
        shuffleButton = findViewById(R.id.shuffleButton)
        playButton = findViewById(R.id.playButton)
        repeatButton = findViewById(R.id.repeatButton)
        nowTitle.isSelected = true // 讓過長的歌名跑馬燈
    }

    // ---------- 音樂庫 ----------

    private fun requiredPermissions(): Array<String> =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(Manifest.permission.READ_MEDIA_AUDIO, Manifest.permission.POST_NOTIFICATIONS)
        } else {
            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

    private fun hasAudioPermission(): Boolean {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_AUDIO
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    }

    private fun refreshLibrary() {
        if (!hasAudioPermission()) {
            showEmpty(getString(R.string.need_permission), showPermissionButton = true)
            return
        }
        if (!scanned) showEmpty(getString(R.string.loading), showPermissionButton = false)
        val unknownArtist = getString(R.string.unknown_artist)
        lifecycleScope.launch {
            val songs = withContext(Dispatchers.IO) {
                runCatching { MusicScanner.scan(applicationContext, unknownArtist) }.getOrDefault(emptyList())
            }
            scanned = true
            if (songs == allSongs) {
                applyFilter()
                return@launch
            }
            allSongs = songs
            rebuildFolders()
            applyFilter()
        }
    }

    private fun rebuildFolders() {
        val counts = allSongs.groupingBy { it.folder }.eachCount().toSortedMap(String.CASE_INSENSITIVE_ORDER)
        folderOptions = listOf<String?>(null) + counts.keys
        val labels = listOf(getString(R.string.all_songs, allSongs.size)) +
            counts.map { (folder, count) -> getString(R.string.folder_item, folder, count) }
        folderSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, labels)

        if (selectedFolder != null && selectedFolder !in counts.keys) {
            selectedFolder = null
        }
        folderSpinner.setSelection(folderOptions.indexOf(selectedFolder).coerceAtLeast(0), false)
    }

    private fun applyFilter() {
        val query = searchInput.text.toString().trim()
        visibleSongs = allSongs.filter { song ->
            (selectedFolder == null || song.folder == selectedFolder) &&
                (query.isEmpty() ||
                    song.title.contains(query, ignoreCase = true) ||
                    song.artist.contains(query, ignoreCase = true) ||
                    song.album.contains(query, ignoreCase = true))
        }
        adapter.submitList(visibleSongs)
        when {
            !hasAudioPermission() -> showEmpty(getString(R.string.need_permission), showPermissionButton = true)
            allSongs.isEmpty() -> showEmpty(getString(R.string.no_songs), showPermissionButton = false)
            visibleSongs.isEmpty() -> showEmpty(getString(R.string.no_match), showPermissionButton = false)
            else -> emptyContainer.visibility = View.GONE
        }
    }

    private fun showEmpty(message: String, showPermissionButton: Boolean) {
        emptyContainer.visibility = View.VISIBLE
        emptyText.text = message
        permissionButton.visibility = if (showPermissionButton) View.VISIBLE else View.GONE
    }

    // ---------- 播放控制 ----------

    private fun playFrom(position: Int) {
        val c = controller ?: return
        if (position !in visibleSongs.indices) return
        c.setMediaItems(visibleSongs.map { it.toMediaItem() }, position, 0L)
        c.prepare()
        c.play()
    }

    private fun setupPlayerControls() {
        playButton.setOnClickListener {
            val c = controller ?: return@setOnClickListener
            when {
                c.mediaItemCount == 0 -> playFrom(0)
                showPauseButton(c) -> c.pause()
                else -> {
                    if (c.playbackState == Player.STATE_IDLE) c.prepare()
                    if (c.playbackState == Player.STATE_ENDED) c.seekToDefaultPosition(0)
                    c.play()
                }
            }
        }
        findViewById<ImageButton>(R.id.prevButton).setOnClickListener { controller?.seekToPrevious() }
        findViewById<ImageButton>(R.id.nextButton).setOnClickListener { controller?.seekToNext() }
        shuffleButton.setOnClickListener {
            controller?.let { it.shuffleModeEnabled = !it.shuffleModeEnabled }
        }
        repeatButton.setOnClickListener {
            val c = controller ?: return@setOnClickListener
            val (mode, message) = when (c.repeatMode) {
                Player.REPEAT_MODE_OFF -> Player.REPEAT_MODE_ALL to R.string.toast_repeat_all
                Player.REPEAT_MODE_ALL -> Player.REPEAT_MODE_ONE to R.string.toast_repeat_one
                else -> Player.REPEAT_MODE_OFF to R.string.toast_repeat_off
            }
            c.repeatMode = mode
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        }
        seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(bar: SeekBar, progress: Int, fromUser: Boolean) {
                if (fromUser) positionText.text = formatTime(progress.toLong())
            }

            override fun onStartTrackingTouch(bar: SeekBar) {
                userSeeking = true
            }

            override fun onStopTrackingTouch(bar: SeekBar) {
                userSeeking = false
                controller?.seekTo(bar.progress.toLong())
            }
        })
    }

    private val playerListener = object : Player.Listener {
        override fun onEvents(player: Player, events: Player.Events) {
            updatePlayerUi()
            if (events.contains(Player.EVENT_MEDIA_METADATA_CHANGED)) {
                updateArtwork(player.mediaMetadata)
            }
        }
    }

    private fun showPauseButton(player: Player) =
        player.playWhenReady &&
            player.playbackState != Player.STATE_ENDED &&
            player.playbackState != Player.STATE_IDLE

    private fun updatePlayerUi() {
        val c = controller ?: return
        val metadata = c.mediaMetadata
        val hasItem = c.currentMediaItem != null
        val title = metadata.title?.toString()?.takeIf { hasItem } ?: getString(R.string.nothing_playing)
        // 只有歌名改變時才重設，避免跑馬燈一直從頭開始
        if (nowTitle.text.toString() != title) nowTitle.text = title
        nowArtist.text = if (hasItem) metadata.artist ?: "" else ""

        playButton.setImageResource(if (showPauseButton(c)) R.drawable.ic_pause else R.drawable.ic_play)

        val accent = MaterialColors.getColor(shuffleButton, androidx.appcompat.R.attr.colorPrimary)
        val normal = MaterialColors.getColor(shuffleButton, com.google.android.material.R.attr.colorOnSurfaceVariant)
        shuffleButton.imageTintList = ColorStateList.valueOf(if (c.shuffleModeEnabled) accent else normal)
        repeatButton.imageTintList = ColorStateList.valueOf(
            if (c.repeatMode == Player.REPEAT_MODE_OFF) normal else accent
        )
        repeatButton.setImageResource(
            if (c.repeatMode == Player.REPEAT_MODE_ONE) R.drawable.ic_repeat_one else R.drawable.ic_repeat
        )

        adapter.currentMediaId = c.currentMediaItem?.mediaId
        updateProgress()
    }

    private fun updateArtwork(metadata: MediaMetadata) {
        val data = metadata.artworkData
        val bitmap = data?.let { runCatching { BitmapFactory.decodeByteArray(it, 0, it.size) }.getOrNull() }
        if (bitmap != null) {
            artwork.setPadding(0, 0, 0, 0)
            artwork.setImageBitmap(bitmap)
        } else {
            val pad = (12 * resources.displayMetrics.density).toInt()
            artwork.setPadding(pad, pad, pad, pad)
            artwork.setImageResource(R.drawable.ic_music_note)
        }
    }

    private fun updateProgress() {
        val c = controller ?: return
        val duration = c.duration.takeIf { it > 0 } ?: 0L
        seekBar.max = duration.toInt()
        durationText.text = formatTime(duration)
        if (!userSeeking) {
            val position = c.currentPosition.coerceIn(0L, duration)
            seekBar.progress = position.toInt()
            positionText.text = formatTime(position)
        }
    }

    private companion object {
        const val KEY_FOLDER = "folder"
    }
}
