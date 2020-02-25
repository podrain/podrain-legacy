import State from '../State'
import m from 'mithril'
import _ from 'lodash'
import QueueModel from './QueueModel'

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
        currently_playing: true
      }
    }).then((result) => {
      return State.db.bulkDocs(result.docs.map(doc => {
        doc.currently_playing = false
        return doc
      }))
    }).then(() => {
      return State.db.find({
        selector: {
          _id: id,
          type: 'episode'
        }
      })
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

      let currentlyPlayingEpisode = _.merge(this.episode, {
        currently_playing: true
      })

      return State.db.put(currentlyPlayingEpisode)
    }).then(() => {
      this.audio = new Audio
      this.audio.src = this.episode.enclosure.url
      this.audio.currentTime = 0
      this.audio.load()
      this.audio.play()

      QueueModel.getQueue()
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