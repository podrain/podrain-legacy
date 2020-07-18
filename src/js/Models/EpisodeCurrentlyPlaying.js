import State from '../State'
import m from 'mithril'
import _ from 'lodash'
import QueueModel from './QueueModel'
import EpisodeModel from './EpisodeModel'
import localforage from 'localforage'

let EpisodeCurrentlyPlaying = {
  episode: null,
  audio: null,
  playhead: 0,

  async playEpisode(id, startPlaying = false) {
    let alreadyPlaying = this.audio.paused ? false : true

    if (this.audio && !this.audio.paused) {
      this.audio.pause()
    }

    // Get currently playing episode and set episode to not playing anymore
    await State.dexieDB.episodes
      .filter(ep => ep.currently_playing == true)
      .modify({ currently_playing: false })

    // Queue up new episode
    let episodeToPlay = (await State.dexieDB.episodes.where({_id: id}).toArray())[0]
    this.episode = episodeToPlay

    // Get episode podcast data side-loaded
    let episodePodcast = (await State.dexieDB.podcasts
      .where({ _id: this.episode.podcast_id }).toArray())[0]
    this.episode.podcast = episodePodcast

    // Update currently playing to the new episode
    await State.dexieDB.episodes.where({ _id: id }).modify({ currently_playing: true })

    // Add episode to end of queue (if not in there already, otherwise leave alone)
    if (!this.episode.queue) {
      await QueueModel.addToQueue(this.episode._id)
    }

    // Start playing the episode
    // Check if episode is downloaded
    if (State.downloadedEpisodes.includes(this.episode._id)) {
      // Array buffer loading strategy
      // let downloadedAudioArrayBuffer = await localforage.getItem('podrain_episode_'+this.episode._id)
      // let daBlob = new Blob([downloadedAudioArrayBuffer], { type: this.episode.enclosure.type })
      // this.audio.src = URL.createObjectURL(daBlob)
      
      // Blob loading strategy
      // let daBlob = await localforage.getItem('podrain_episode_'+this.episode._id)
      // this.audio.src = URL.createObjectURL(daBlob)

      // Blob load and convert to array buffer (and back to blob)
      let daBlob = await localforage.getItem('podrain_episode_'+this.episode._id)
      let blobAB = await daBlob.arrayBuffer()
      let newBlob = new Blob([blobAB], { type: this.episode.enclosure.type })
      this.audio.src = URL.createObjectURL(newBlob)
    } else {
      this.audio.src = this.episode.enclosure.url
    }
    this.audio.currentTime = this.episode.playhead
    this.audio.load()
    if (alreadyPlaying || startPlaying) {
      this.audio.play()
    }

    this.updatePlayhead(true)

    // Refresh the queue
    await QueueModel.getQueue()
  },

  playOrPause() {
    if (this.audio.paused) {
      this.audio.play()
    } else {
      this.audio.pause()
    }
  },

  async updatePlayhead(updateDB = false) {
    this.playhead = this.audio.currentTime

    if (updateDB) {
      State.dexieDB.episodes.where({ _id: this.episode._id }).modify({ playhead: this.playhead })
    }

    m.redraw()
  },

  setPlayhead(value) {
    this.playhead = this.audio.currentTime = value
  },

  jumpAhead() {
    this.setPlayhead(this.audio.currentTime += 15)
    this.updatePlayhead(true)
  },

  jumpBack() {
    this.setPlayhead(this.audio.currentTime -= 15)
    this.updatePlayhead(true)
  },

  async playNext(startPlaying = false, finishEpisode = false) {
    let oldEpisodeId = _.clone(this.episode._id)
    this.episode = (await State.dexieDB.episodes.where({ _id: this.episode._id }).toArray())[0]

    // if last in queue, play the first in queue after
    if (this.episode.queue == (await QueueModel.lastInQueue()).queue) {
      let firstInQueue = QueueModel.queue.filter(q => q.queue == 1)[0]
      await this.playEpisode(firstInQueue._id, startPlaying)
    } else { // Otherwise, play next in queue
      let nextInQueue = QueueModel.queue.filter(q => q.queue == this.episode.queue + 1)[0]
      await this.playEpisode(nextInQueue._id, startPlaying)
    }

    if (finishEpisode) {
      // Remove from queue
      await QueueModel.removeFromQueue(oldEpisodeId)
      // set mark as done and reset playhead
      await State.dexieDB.episodes.where({ _id: oldEpisodeId }).modify({ playhead: 0, played: true })
      // Delete downloaded episode if there is one
      EpisodeModel.removeDownload(oldEpisodeId)

      this.episode = await EpisodeModel.getEpisode(this.episode._id)
    }

    QueueModel.getQueue()
  },

  async playPrev(startPlaying = false) {
    this.episode = (await State.dexieDB.episodes.where({ _id: this.episode._id }).toArray())[0]

    if (this.episode.queue == 1) {
      let lastInQueue = await QueueModel.lastInQueue()
      await this.playEpisode(lastInQueue._id, startPlaying)
    } else { // Otherwise, play next in queue
      let prevInQueue = QueueModel.queue.filter(q => q.queue == this.episode.queue - 1)[0]
      await this.playEpisode(prevInQueue._id, startPlaying)
    }

    QueueModel.getQueue()
  }
}

export default EpisodeCurrentlyPlaying