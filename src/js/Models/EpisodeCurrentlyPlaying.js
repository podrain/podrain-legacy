import State from '../State'
import m from 'mithril'
import _ from 'lodash'
import QueueModel from './QueueModel'

let EpisodeCurrentlyPlaying = {
  episode: null,
  audio: null,
  playhead: 0,
  playing: false,

  async playEpisode(id, startPlaying = false) {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
      this.audio = null
    }

    // Get currently playing episode
    let currentlyPlayingEpisode = await State.db.find({
      selector: {
        currently_playing: true
      }
    })

    // Set episode to not playing anymore
    await State.db.bulkDocs(currentlyPlayingEpisode.docs.map(doc => {
      doc.currently_playing = false
      return doc
    }))

    // Queue up new episode
    let episodeToPlay = await State.db.find({
      selector: {
        _id: id,
        type: 'episode'
      }
    })
    this.episode = episodeToPlay.docs[0]

    // Get episode podcast data side-loaded
    let episodePodcast = await State.db.find({
      selector: {
        _id: this.episode.podcast_id,
        type: 'podcast'
      }
    })
    this.episode.podcast = episodePodcast.docs[0]

    // Update currently playing to the new episode
    let currentlyPlayingEpisodeUpdate = _.merge(this.episode, {
      currently_playing: true
    })
    await State.db.put(currentlyPlayingEpisodeUpdate)

    // Start playing the episode
    this.audio = new Audio
    this.audio.src = this.episode.enclosure.url
    this.audio.currentTime = this.episode.playhead
    this.audio.load()
    if (this.playing || startPlaying) {
      this.audio.play()
    }

    // Refresh the queue
    QueueModel.getQueue()
    m.redraw()
  },

  playOrPause() {
    if (this.audio.paused) {
      this.playing = true
      this.audio.play()
    } else {
      this.playing = false
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

  async playNext() {
    await QueueModel.getQueue()
    // if last in queue, play the first in queue after
    if (this.episode.queue == (await QueueModel.lastInQueue()).queue) {
      let firstInQueue = QueueModel.queue.filter(q => q.queue == 1)[0]
      this.playEpisode(firstInQueue._id)
    } else { // Otherwise, play next in queue
      let nextInQueue = QueueModel.queue.filter(q => q.queue == this.episode.queue + 1)[0]
      this.playEpisode(nextInQueue._id)
    }
  },

  async playPrev() {
    await QueueModel.getQueue()

    if (this.episode.queue == 1) {
      let lastInQueue = await QueueModel.lastInQueue()
      this.playEpisode(lastInQueue._id)
    } else { // Otherwise, play next in queue
      let prevInQueue = QueueModel.queue.filter(q => q.queue == this.episode.queue - 1)[0]
      this.playEpisode(prevInQueue._id)
    }
  }
}

export default EpisodeCurrentlyPlaying