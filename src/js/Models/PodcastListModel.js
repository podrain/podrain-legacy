import m from 'mithril'
import State from '../State'

let PodcastListModel = {
  podcasts: [],

  getPodcasts() {
    State.db.find({
      selector: {
        type: 'podcast'
      }
    }).then(response => {
      this.podcasts = response.docs
      m.redraw()
    })
  }
}

export default PodcastListModel