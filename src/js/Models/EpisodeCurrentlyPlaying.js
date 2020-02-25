import State from '../State'
import m from 'mithril'
import _ from 'lodash'
import QueueModel from './QueueModel'

let EpisodeCurrentlyPlaying = {
  episode: null,
  audio: null,
  playhead: 0,

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
      this.audio.currentTime = this.episode.playhead
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
  },

  updatePlayhead() {
    this.playhead = this.audio.currentTime
    m.redraw()
  },

  setPlayhead(value) {
    this.playhead = this.audio.currentTime = value
  },

  jumpAhead() {
    this.setPlayhead(this.audio.currentTime += 15)
  },

  jumpBack() {
    this.setPlayhead(this.audio.currentTime -= 15)
  },
}

export default EpisodeCurrentlyPlaying