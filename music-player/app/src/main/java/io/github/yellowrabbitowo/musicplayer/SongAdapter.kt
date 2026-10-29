package io.github.yellowrabbitowo.musicplayer

import android.annotation.SuppressLint
import android.graphics.Typeface
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.color.MaterialColors

class SongAdapter(
    private val onClick: (position: Int) -> Unit,
) : ListAdapter<Song, SongAdapter.ViewHolder>(DIFF) {

    var currentMediaId: String? = null
        @SuppressLint("NotifyDataSetChanged")
        set(value) {
            if (field != value) {
                field = value
                notifyDataSetChanged()
            }
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_song, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val song = getItem(position)
        val playing = song.uri.toString() == currentMediaId
        holder.title.text = song.title
        holder.subtitle.text = buildString {
            append(song.artist)
            if (song.album.isNotEmpty()) append(" · ").append(song.album)
            append(" · ").append(formatTime(song.durationMs))
        }
        holder.title.setTextColor(if (playing) holder.accentColor else holder.normalColor)
        holder.title.setTypeface(null, if (playing) Typeface.BOLD else Typeface.NORMAL)
        holder.itemView.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos != RecyclerView.NO_POSITION) onClick(pos)
        }
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.songTitle)
        val subtitle: TextView = view.findViewById(R.id.songSubtitle)
        val accentColor = MaterialColors.getColor(view, androidx.appcompat.R.attr.colorPrimary)
        val normalColor = title.currentTextColor
    }

    private companion object {
        val DIFF = object : DiffUtil.ItemCallback<Song>() {
            override fun areItemsTheSame(a: Song, b: Song) = a.id == b.id
            override fun areContentsTheSame(a: Song, b: Song) = a == b
        }
    }
}
