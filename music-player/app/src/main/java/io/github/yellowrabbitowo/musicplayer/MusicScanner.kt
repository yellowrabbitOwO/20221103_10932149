package io.github.yellowrabbitowo.musicplayer

import android.content.ContentUris
import android.content.Context
import android.os.Build
import android.provider.MediaStore
import java.io.File

/** 透過 MediaStore 讀取手機上所有的 MP3／音樂檔案（不需要自己掃描整個儲存空間）。 */
object MusicScanner {

    fun scan(context: Context, unknownArtist: String): List<Song> {
        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
        } else {
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        }

        val projection = buildList {
            add(MediaStore.Audio.Media._ID)
            add(MediaStore.Audio.Media.TITLE)
            add(MediaStore.Audio.Media.ARTIST)
            add(MediaStore.Audio.Media.ALBUM)
            add(MediaStore.Audio.Media.DURATION)
            add(MediaStore.Audio.Media.DISPLAY_NAME)
            @Suppress("DEPRECATION")
            add(MediaStore.Audio.Media.DATA)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) add(MediaStore.Audio.Media.RELATIVE_PATH)
        }.toTypedArray()

        // MP3 或被系統標記為音樂的檔案，排除鈴聲、通知音、鬧鐘音
        val selection = "(${MediaStore.Audio.Media.MIME_TYPE} = 'audio/mpeg' OR ${MediaStore.Audio.Media.IS_MUSIC} != 0)" +
            " AND ${MediaStore.Audio.Media.IS_RINGTONE} = 0" +
            " AND ${MediaStore.Audio.Media.IS_NOTIFICATION} = 0" +
            " AND ${MediaStore.Audio.Media.IS_ALARM} = 0"

        val songs = mutableListOf<Song>()
        context.contentResolver.query(collection, projection, selection, null, null)?.use { c ->
            val idCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val durationCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val nameCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
            @Suppress("DEPRECATION")
            val dataCol = c.getColumnIndex(MediaStore.Audio.Media.DATA)
            val relCol = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                c.getColumnIndex(MediaStore.Audio.Media.RELATIVE_PATH)
            } else -1

            while (c.moveToNext()) {
                val id = c.getLong(idCol)
                val displayName = c.getString(nameCol).orEmpty()
                val title = c.getString(titleCol)?.takeIf { it.isNotBlank() }
                    ?: displayName.substringBeforeLast('.')
                val artist = c.getString(artistCol)
                    ?.takeIf { it.isNotBlank() && it != MediaStore.UNKNOWN_STRING }
                    ?: unknownArtist
                val album = c.getString(albumCol)
                    ?.takeIf { it != MediaStore.UNKNOWN_STRING }
                    .orEmpty()

                val relative = if (relCol >= 0) c.getString(relCol) else null
                val folder = relative?.trimEnd('/')?.takeIf { it.isNotEmpty() }
                    ?: c.getString(dataCol.coerceAtLeast(0))?.let { File(it).parentFile?.name }
                    ?: "/"

                songs += Song(
                    id = id,
                    uri = ContentUris.withAppendedId(collection, id),
                    title = title,
                    artist = artist,
                    album = album,
                    durationMs = c.getLong(durationCol),
                    folder = folder,
                )
            }
        }
        return songs.sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.title })
    }
}
