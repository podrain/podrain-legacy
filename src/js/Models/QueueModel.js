import State from '../State'
import m from 'mithril'
import _ from 'lodash'

let QueueModel = {
  queue: [],

  getQueue() {
    return State.db.find({
      selector: {
        type: 'episode',
        queue: {
          $gt: 0
        }
      },
      limit: 99999
    }).then(response => {
      this.queue = _.sortBy(response.docs, 'queue')
      m.redraw()
    })
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

  removeFromQueue(id) {
    return State.db.get(id).then((doc) => {
      delete doc.queue
      return State.db.put(doc)
    }).then(() => {
      m.redraw()
    })
  }
}

export default QueueModel