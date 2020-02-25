import State from '../State'
import m from 'mithril'
import _ from 'lodash'

let QueueModel = {
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
  }
}

export default QueueModel