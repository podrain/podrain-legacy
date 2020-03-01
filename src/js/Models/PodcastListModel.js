import m from 'mithril'
import State from '../State'

let PodcastListModel = {
  podcasts: [],
  loading: false,

  getPodcasts() {
    this.loading = true
    State.db.find({
      selector: {
        type: 'podcast'
      }
    }).then(response => {
      this.podcasts = response.docs
      this.loading = false
      m.redraw()
    })
  }
}

export default PodcastListModel