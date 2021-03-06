import State from '../State'
import m from 'mithril'
import _ from 'lodash'

let QueueModel = {
  queue: [],
  queueChanging: false,

  async getQueue() {
    // Fix queue each time it's fetched

    let queuedEpisodes = await State.dexieDB.episodes.filter(ep => {
      return ep.queue > 0
    }).toArray()

    let episodesWithPodcastsPromises = queuedEpisodes.map(async (qe) => {
      qe.podcast = (await State.dexieDB.podcasts.where({ _id: qe.podcast_id }).toArray())[0]
      return qe
    })

    let episodesWithPodcasts = await Promise.all(episodesWithPodcastsPromises)

    this.queue = _.sortBy(episodesWithPodcasts, 'queue')
    m.redraw()
  },

  async addToQueue(id) {
    this.queueChanging = true

    let episodesInQueue = await State.dexieDB.episodes.filter(ep => {
      return ep.queue > 0
    }).toArray()

    let highestQueue = episodesInQueue.length > 0 ? Math.max(...episodesInQueue.map(ep => ep.queue)) : 0

    await State.dexieDB.episodes.where({ _id: id }).modify({ queue: highestQueue + 1 })
    await this.getQueue()
    this.queueChanging = false
  },

  async removeFromQueue(id) {
    this.queueChanging = true

    let episode = (await State.dexieDB.episodes.where({ _id: id }).toArray())[0]

    let currentEpisodeQueue = _.clone(episode.queue) // clone current episode queue value for later use
    // episode.queue = 0 // Remove episode from queue

    await State.dexieDB.episodes.where({ _id: id }).modify({ queue: 0 })

    // Subract queue from episodes after

    let higherInQueue = await State.dexieDB.episodes.filter(ep => {
      return ep.queue > currentEpisodeQueue
    }).toArray()

    if (higherInQueue.length > 0) {
      for (let hiq of higherInQueue) {
        hiq.queue -= 1
        await State.dexieDB.episodes.where({ _id: hiq._id }).modify({ queue: hiq.queue })
      }
    }
    await this.getQueue()
    this.queueChanging = false
  },

  async lastInQueue() {
    let episodesInQueue = await State.dexieDB.episodes.filter(ep => {
      return ep.queue > 0
    }).toArray()

    let highestQueue = episodesInQueue.length > 0 ? Math.max(...episodesInQueue.map(ep => ep.queue)) : 0
    let lastEpisodeInQueue = episodesInQueue.filter(eiq => eiq.queue == highestQueue)[0]
    return lastEpisodeInQueue
  },

  async reorder(episodeID, newOrder) {
    this.queueChanging = true
    let currentEpisode = (await State.dexieDB.episodes.where({ _id: episodeID }).toArray())[0]
    let reorderPromises = []

    if (newOrder < currentEpisode.queue) {
      let higherInQueue = await State.dexieDB.episodes.filter(ep => {
        return ep.queue >= newOrder && ep.queue < currentEpisode.queue
      }).toArray()

      for (let hiq of higherInQueue) {
        reorderPromises.push(State.dexieDB.episodes.where({ _id: hiq._id }).modify({ queue: hiq.queue + 1 }))
      }

    } else if (newOrder > currentEpisode.queue) {
      let lowerInQueue = await State.dexieDB.episodes.filter(ep => {
        return ep.queue <= newOrder && ep.queue > currentEpisode.queue
      }).toArray()

      for (let liq of lowerInQueue) {
        reorderPromises.push(State.dexieDB.episodes.where({ _id: liq._id }).modify({ queue: liq.queue - 1 }))
      }
    }

    await Promise.all([
      State.dexieDB.episodes.where({ _id: episodeID }).modify({ queue: newOrder }),
      ...reorderPromises
    ])

    await this.getQueue()
    this.queueChanging = false
  },

  async fixQueue() {
    this.queueChanging = true

    let queuedEpisodes = await State.dexieDB.episodes.filter(ep => {
      return ep.queue > 0
    }).toArray()

    let queuedEpisodesSorted = _.orderBy(queuedEpisodes, ['queue'], ['asc'])

    let i = 1
    for (let qes of queuedEpisodesSorted) {
      if (qes.queue != i) {
        await State.dexieDB.episodes.where({ _id: qes._id }).modify({ queue: i })
      }
      i++
    }

    this.queueChanging = false
  }
}

export default QueueModel