import m from 'mithril'
import State from '../State'
import _ from 'lodash'
import pfp from 'podcast-feed-parser'
import uuidv4 from 'uuid/v4'

let PodcastShowModel = {
  podcast: {},
  episodes: [],
  loading: false,
  refreshing: false,

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
  },

  async refreshEpisodes(id) {
    this.refreshing = true
    let podcast = await State.db.get(id)

    let currentEpisodes = (await State.db.find({
      selector: {
        type: 'episode',
        podcast_id: podcast._id
      },
      limit: 99999
    })).docs

    let proxyUrl = 'https://example.com/'

    let feedResponse = await m.request(proxyUrl + podcast.feed_url, {
      extract: function(xhr) {
        return xhr
      }
    })
    
    let feedData = feedResponse.responseText
    let podcastParsed = pfp.getPodcastFromFeed(feedData)

    let newEpisodes = podcastParsed.episodes.filter((ep) => {
      return !currentEpisodes.map(epCurr => epCurr.enclosure.url).includes(ep.enclosure.url)
    }).map(ep => {
      return _.merge(ep, {
        '_id': uuidv4(),
        'podcast_id': podcast._id,
        'type': 'episode',
        'queue': 0,
        'playhead': 0,
        'currently_playing': false,
        'played': false
      })
    })

    await State.db.bulkDocs(newEpisodes)
    this.refreshing = false
  }
}

export default PodcastShowModel
