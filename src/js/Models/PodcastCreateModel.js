import m from 'mithril'
import State from '../State'
import podcastFeedParser from 'podcast-feed-parser'
import uuidv4 from 'uuid/v4'
import _ from 'lodash'
import PodcastListModel from './PodcastListModel'

let PodcastCreateModel = {
  proxyUrl: process.env.PROXY_URL+'/',
  feedUrl: '',
  search: '',
  searchResults: [],
  searching: false,
  addingPodcast: false,
  addingPodcastSearchIds: [],

  setSearch(value) {
    this.search = value
    this.searching = true
    this.searchPodcastsDelay()
  },

  addPodcast(podcastUrl, fromSearch = false) {
    this.addingPodcastSearchIds.push({
      feed_url: podcastUrl,
      episodesAdded: 0,
      episodesTotal: 0,
    })

    return m.request(this.proxyUrl + podcastUrl, {
      extract: function(xhr) {
        return xhr
      },
      headers: {
        'accept': 'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4'
      }
    }).then(response => {
      let feedData = response.responseText
      let podcast = podcastFeedParser.getPodcastFromFeed(feedData)
      let podcastOnly = _.clone(podcast)

      delete podcastOnly.episodes

      let podcastID = uuidv4()

      let addingPodcastIndex = null
      if (fromSearch) {
        addingPodcastIndex = _.findIndex(this.addingPodcastSearchIds, (apsi) => {
          return apsi.feed_url == podcastUrl
        })
        this.addingPodcastSearchIds[addingPodcastIndex].episodesTotal = podcast.episodes.length
      }

      let addPodcast = State.db.put(_.merge(podcastOnly, {
        '_id': podcastID,
        'type': 'podcast',
        'feed_url': podcastUrl
      }))

      /* Test refresh podcast by not including all episodes at first */
      // podcast.episodes = _.sortBy(podcast.episodes, function(ep) {
      //   return ep.pubDate
      // })

      // podcast.episodes.pop()
      // podcast.episodes.pop()
      // podcast.episodes.pop()
      // podcast.episodes.pop()
      // podcast.episodes.pop()

      // console.log(podcast.episodes.length)

      let addPodcastEpisodes = []
      for (let ep of podcast.episodes) {
        addPodcastEpisodes.push(State.db.put(_.merge(ep, {
          '_id': uuidv4(),
          'podcast_id': podcastID,
          'type': 'episode',
          'queue': 0,
          'playhead': 0,
          'currently_playing': false,
          'played': false
        })).then(() => {
          if (fromSearch) {
            this.addingPodcastSearchIds[addingPodcastIndex].episodesAdded += 1
          }
          m.redraw()
        }))
      }

      return Promise.all([addPodcast, ...addPodcastEpisodes])
    }).then(() => {
      this.addingPodcast = false
    })
  },

  searchPodcastsDelay: _.debounce(() => {
    PodcastCreateModel.searchPodcasts()
  }, 250),

  searchPodcasts() {
    return m.request('https://itunes.apple.com/search', {
      params: {
        term: this.search,
        media: 'podcast',
        entity: 'podcast'
      }
    }).then(result => {
      this.searchResults = result.results
      this.searching = false
    })
  }
}

export default PodcastCreateModel