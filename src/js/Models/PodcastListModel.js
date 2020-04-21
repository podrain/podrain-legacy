import m from 'mithril'
import State from '../State'

let PodcastListModel = {
  podcasts: [],
  loading: false,

  getPodcasts() {
    this.loading = true

    State.dexieDB.podcasts.toArray().then(result => {
      this.podcasts = result
      this.loading = false
      m.redraw()
    })
  }
}

export default PodcastListModel