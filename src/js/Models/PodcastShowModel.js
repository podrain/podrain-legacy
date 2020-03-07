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
    let podcast = await State.db.get(id)
    this.podcast = podcast
    m.redraw()
  },

  async getEpisodes(id) {
    await State.db.createIndex({
      index: {
        fields: [
          'pubDate',
          'podcast_id',
          'type'
        ]
      }
    })

    let episodes = (await State.db.find({
      selector: {
        podcast_id: id,
        type: 'episode',
        pubDate: {
          $gt: true
        }
      },
      sort: [
        {'pubDate': 'desc'}
      ],
      limit: 10
    })).docs

    this.episodes = episodes
    m.redraw()
  },

  async getMoreEpisodes(id, numEpisodes) {
    await State.db.createIndex({
      index: {
        fields: [
          'pubDate',
          'podcast_id',
          'type'
        ]
      }
    })

    let newEpisodes = (await State.db.find({
      selector: {
        podcast_id: id,
        type: 'episode',
        pubDate: {
          $lt: this.episodes[this.episodes.length - 1].pubDate
        }
      },
      sort: [
        {'pubDate': 'desc'}
      ],
      limit: numEpisodes
    })).docs

    for (let ne of newEpisodes) {
      this.episodes.push(ne)
    }

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

    let proxyUrl = process.env.PROXY_URL || ""

    let feedResponse = await m.request(proxyUrl + podcast.feed_url, {
      extract: function(xhr) {
        return xhr
      },
      headers: {
        'accept': 'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4'
      }
    })
    
    let feedData = feedResponse.responseText
    let podcastParsed = pfp.getPodcastFromFeed(feedData)

    let newEpisodes = podcastParsed.episodes.filter((ep) => {
      return ep.pubDate > _.max(currentEpisodes.map(epCurr => epCurr.pubDate))
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
