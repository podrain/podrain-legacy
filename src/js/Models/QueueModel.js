import State from '../State'
import m from 'mithril'
import _ from 'lodash'

let QueueModel = {
  queue: [],

  async getQueue() {
    let queuedEpisodes = await State.db.find({
      selector: {
        type: 'episode',
        queue: {
          $gt: 0
        }
      },
      limit: 99999
    })

    let episodesWithPodcastsPromises = queuedEpisodes.docs.map(async (qe) => {
      qe.podcast = await State.db.get(qe.podcast_id)
      return qe
    })

    let episodesWithPodcasts = await Promise.all(episodesWithPodcastsPromises)

    this.queue = _.sortBy(episodesWithPodcasts, 'queue')
    m.redraw()
  },

  async addToQueue(id) {
    let episodeToAdd = await State.db.get(id)

    let episodesInQueue = await State.db.find({
      selector: {
        type: 'episode',
        queue: {
          $gt: 0
        }
      }
    })

    let highestQueue = episodesInQueue.docs.length > 0 ? Math.max(...episodesInQueue.docs.map(ep => ep.queue)) : 0

    let updatedDoc = _.merge(episodeToAdd, {
      _id: id,
      _rev: episodeToAdd._rev,
      queue: highestQueue + 1
    })

    await State.db.put(updatedDoc)

    m.redraw()
  },

  async removeFromQueue(id) {
    let episode = await State.db.get(id)

    let currentEpisodeQueue = _.clone(episode.queue) // clone current episode queue value for later use
    episode.queue = 0 // Remove episode from queue
    await State.db.put(episode)

    // Subract queue from episodes after
    let higherInQueue = (await State.db.find({
      selector: {
        type: 'episode',
        queue: {
          $gt: currentEpisodeQueue
        }
      }
    })).docs

    for (let hiq of higherInQueue) {
      hiq.queue -= 1
      await State.db.put(hiq)
    }

    m.redraw()
  },

  async lastInQueue() {
    let episodesInQueue = (await State.db.find({
      selector: {
        type: 'episode',
        queue: {
          $gt: 0
        }
      }
    })).docs

    let highestQueue = episodesInQueue.length > 0 ? Math.max(...episodesInQueue.map(ep => ep.queue)) : 0
    let lastEpisodeInQueue = episodesInQueue.filter(eiq => eiq.queue == highestQueue)[0]
    return lastEpisodeInQueue
  }
}

export default QueueModel