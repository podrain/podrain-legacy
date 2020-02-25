import State from '../State'
import m from 'mithril'
import _ from 'lodash'
import QueueModel from './QueueModel'

let EpisodeCurrentlyPlaying = {
  episode: null,
  audio: null,
  playhead: 0,

  async playEpisode(id) {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
      this.audio = null
    }

    let currentlyPlayingEpisode = await State.db.find({
      selector: {
        currently_playing: true
      }
    })

    await State.db.bulkDocs(currentlyPlayingEpisode.docs.map(doc => {
      doc.currently_playing = false
      return doc
    }))

    let episodeToPlay = await State.db.find({
      selector: {
        _id: id,
        type: 'episode'
      }
    })

    this.episode = episodeToPlay.docs[0]

    let episodePodcast = await State.db.find({
      selector: {
        _id: this.episode.podcast_id,
        type: 'podcast'
      }
    })
        
    this.episode.podcast = episodePodcast.docs[0]

    let currentlyPlayingEpisodeUpdate = _.merge(this.episode, {
      currently_playing: true
    })

    await State.db.put(currentlyPlayingEpisodeUpdate)

    this.audio = new Audio
    this.audio.src = this.episode.enclosure.url
    this.audio.currentTime = this.episode.playhead
    this.audio.load()
    this.audio.play()

    await QueueModel.getQueue()
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