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

      let podcastID = uuidv4()

      State.db.put(_.merge(podcastOnly, {
        '_id': podcastID,
        'type': 'podcast'
      })).then(() => {
        PodcastListModel.getPodcasts()
      })

      for (let ep of podcast.episodes) {
        State.db.put(_.merge(ep, {
          '_id': uuidv4(),
          'podcast_id': podcastID,
          'type': 'episode',
          'queue': 0,
          'playhead': 0,
          'currently_playing': false,
          'played': false
        }))
      }
    })
  }
}

export default PodcastCreateModel