import m from 'mithril'
import State from '../State'
import podcastFeedParser from 'podcast-feed-parser'
import uuidv4 from 'uuid/v4'
import _ from 'lodash'
import PodcastListModel from './PodcastListModel'

let PodcastCreateModel = {
  proxyUrl: 'https://example.com/',
  url: '',

  addPodcast() {
    m.request(this.proxyUrl + this.url, {
      extract: function(xhr) {
        return xhr
      }
    }).then(response => {
      let feedData = response.responseText
      let podcast = podcastFeedParser.getPodcastFromFeed(feedData)
      let podcastOnly = _.clone(podcast)

      delete podcastOnly.episodes

      State.db.put(_.merge(podcastOnly, {
        '_id': uuidv4(),
        'type': 'podcast'
      })).then(() => {
        PodcastListModel.getPodcasts()
      })

      for (let ep of podcast.episodes) {
        State.db.put(_.merge(ep, {
          '_id': uuidv4(),
          'type': 'episode'
        }))
      }
    })
  }
}

export default PodcastCreateModel