import State from '../State'
import m from 'mithril'

let EpisodeCurrentlyPlaying = {
  episode: null,
  audio: null,

  playEpisode(id) {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
      this.audio = null
    }

    return State.db.find({
      selector: {
        _id: id,
        type: 'episode'
      }
    }).then((result) => {
      this.episode = result.docs[0]

      return State.db.find({
        selector: {
          _id: this.episode.podcast_id,
          type: 'podcast'
        }
      })
    }).then((result) => {
      this.episode.podcast = result.docs[0]
      this.audio = new Audio
      this.audio.src = this.episode.enclosure.url
      this.audio.currentTime = 0
      this.audio.load()
      this.audio.play()

      return m.redraw()
    })
  },

  playOrPause() {
    if (this.audio.paused) {
      this.audio.play()
    } else {
      this.audio.pause()
    }

    m.redraw()
  }
}

export default EpisodeCurrentlyPlaying