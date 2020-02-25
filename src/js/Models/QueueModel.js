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
      this.queue = response.docs
      m.redraw()
    })
  },

  addToQueue(id) {
    return State.db.get(id).then((doc) => {
      let updatedDoc = _.merge(doc, {
        _id: id,
        _rev: doc._rev,
        queue: 1
      })

      return State.db.put(updatedDoc)
    }).then(() => {
      m.redraw()
    })
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