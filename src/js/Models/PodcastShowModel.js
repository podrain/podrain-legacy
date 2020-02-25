import m from 'mithril'
import State from '../State'

let PodcastShowModel = {
  podcast: {},
  episodes: [],
  loading: false,

  getPodcast(id) {
    return State.db.find({
      selector: {
        type: 'podcast',
        _id: id
      }
    }).then(response => {
      this.podcast = response.docs[0]
      m.redraw()
    })
  },

  getEpisodes(id) {
    return State.db.createIndex({
      index: {
        fields: [
          'podcast_id',
          'type',
          'pubDate'
        ]
      }
    }).then(() => {
      return State.db.find({
        selector: {
          podcast_id: id,
          type: "episode",
        },
        sort: [
          {'pubDate': 'desc'}
        ],
        limit: 99999
      })
    }).then(response => {
      this.episodes = response.docs
      m.redraw()
      console.log(this.episodes)
    })
  }
}

export default PodcastShowModel
