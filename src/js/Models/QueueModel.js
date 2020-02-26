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
    episode.queue = 0
    await State.db.put(episode)
    m.redraw()
  }
}

export default QueueModel