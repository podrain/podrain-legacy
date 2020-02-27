import m from 'mithril'
import State from '../State'
import _ from 'lodash'

let PodcastShowModel = {
  podcast: {},
  episodes: [],
  loading: false,

  async getPodcast(id) {
    let podcast = (await State.db.find({
      selector: {
        type: 'podcast',
        _id: id
      }
    })).docs[0]

    this.podcast = podcast
    m.redraw()
  },

  async getEpisodes(id) {
    await State.db.createIndex({
      index: {
        fields: [
          'podcast_id',
          'type',
          'pubDate'
        ]
      }
    })

    let episodes = (await State.db.find({
      selector: {
        podcast_id: id,
        type: 'episode'
      },
      limit: 99999
    })).docs

    this.episodes = _.orderBy(episodes, ['pubDate'], ['desc'])
    m.redraw()
  }
}

export default PodcastShowModel
