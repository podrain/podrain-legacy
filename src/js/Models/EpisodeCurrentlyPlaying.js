import State from '../State'
import m from 'mithril'

let EpisodeCurrentlyPlaying = {
  episode: null,
  audio: null,

  playEpisode(id) {
    return State.db.find({
      selector: {
        _id: id,
        type: 'episode'
      }
    }).then((result) => {
      this.episode = result.docs[0]
      this.audio = new Audio
      this.audio.pause()
      this.audio.src = this.episode.enclosure.url
      // this.audio.currentTime = this.episode.playhead

      return State.db.find({
        selector: {
          _id: this.episode.podcast_id,
          type: 'podcast'
        }
      })
    }).then((result) => {
      this.episode.podcast = result.docs[0]
      console.log(result.docs[0])
      this.audio.load()
      this.audio.play()

      m.redraw()
    })
  }
}

export default EpisodeCurrentlyPlaying