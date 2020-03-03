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
  episodesAdded: 0,
  episodesTotal: 0,

  setSearch(value) {
    this.search = value
    this.searching = true
    this.searchPodcastsDelay()
  },

  addPodcast(podcastUrl) {
    this.feedUrl = podcastUrl
    return m.request(this.proxyUrl + this.feedUrl, {
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
      this.episodesTotal = podcast.episodes.length

      let addPodcast = State.db.put(_.merge(podcastOnly, {
        '_id': podcastID,
        'type': 'podcast',
        'feed_url': this.feedUrl
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
          this.episodesAdded += 1
          m.redraw()
        }))
      }

      return Promise.all([addPodcast, ...addPodcastEpisodes])
    }).then(() => {
      this.feedUrl = ''
      this.episodesAdded = 0
      this.episodesTotal = 0
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