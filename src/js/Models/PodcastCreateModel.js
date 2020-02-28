import m from 'mithril'
import State from '../State'
import podcastFeedParser from 'podcast-feed-parser'
import uuidv4 from 'uuid/v4'
import _ from 'lodash'
import PodcastListModel from './PodcastListModel'

let PodcastCreateModel = {
  proxyUrl: 'https://example.com/',
  url: '',
  search: '',
  searchResults: [],
  searching: false,
  addingPodcast: false,

  setSearch(value) {
    this.search = value
    this.searching = true
    this.searchPodcastsDelay()
  },

  addPodcast() {
    this.addingPodcast = true
    return m.request(this.proxyUrl + this.url, {
      extract: function(xhr) {
        return xhr
      }
    }).then(response => {
      let feedData = response.responseText
      let podcast = podcastFeedParser.getPodcastFromFeed(feedData)
      let podcastOnly = _.clone(podcast)

      delete podcastOnly.episodes

      let podcastID = uuidv4()

      let addPodcast = State.db.put(_.merge(podcastOnly, {
        '_id': podcastID,
        'type': 'podcast'
      })).then(() => {
        PodcastListModel.getPodcasts()
        this.search = ''
        this.searchResults = []
        this.url = ''
      })

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
        })))
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