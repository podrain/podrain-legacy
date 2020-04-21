import m from 'mithril'
import State from '../State'
import _ from 'lodash'
import feedParser from 'podrain-feed-parser'
import localforage from 'localforage'
import uuidv4 from 'uuid/v4'
import PodcastModel from './PodcastModel'
import EpisodeModel from './EpisodeModel'
import QueueModel from './QueueModel'

let PodcastShowModel = {
  podcast: {},
  episodes: [],
  allEpisodes: [],
  loading: false,
  refreshing: false,
  deleting: false,

  async getPodcast(id) {
    let podcast = await State.dexieDB.podcasts.where({_id: id}).first()
    this.podcast = podcast
    m.redraw()
  },

  async getEpisodes(id) {
    let episodes = await State.dexieDB.episodes.where({
      podcast_id: id
    }).reverse().sortBy('pubDate')

    this.allEpisodes = episodes
    this.episodes = this.allEpisodes.slice(0, 10)
    m.redraw()
  },

  async getMoreEpisodes(id, numEpisodes) {
    let newBatch = this.allEpisodes.slice(this.episodes.length, this.episodes.length + numEpisodes)
    this.episodes = this.episodes.concat(newBatch)

    m.redraw()
  },

  async refreshEpisodes(id) {
    this.refreshing = true
    let podcast = await State.dexieDB.podcasts.where({_id: id}).first()

    let currentEpisodes = await State.dexieDB.episodes.where({ podcast_id: podcast._id }).toArray()

    let proxyUrl = localStorage.getItem('proxy_url') || ""

    let feedResponse = await m.request(proxyUrl + podcast.feed_url, {
      extract: function(xhr) {
        return xhr
      },
      headers: {
        'accept': 'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4'
      }
    })
    
    let feedData = feedResponse.responseText
    let podcastParsed = await feedParser.parseFeed(feedData, {
      proxyURL: localStorage.getItem('proxy_url'),
      getAllPages: true
    })

    let newEpisodes = podcastParsed.episodes.filter((ep) => {
      return ep.pubDate > _.max(currentEpisodes.map(epCurr => epCurr.pubDate))
    }).map(ep => {
      return _.merge(ep, {
        '_id': uuidv4(),
        'podcast_id': podcast._id,
        'queue': 0,
        'playhead': 0,
        'currently_playing': false,
        'played': false
      })
    })

    await State.dexieDB.episodes.bulkAdd(newEpisodes)
    this.refreshing = false
  },

  async deletePodcast(id) {
    this.deleting = true
    let podcast = await State.dexieDB.podcasts.where({_id: id}).first()

    let episodesInQueue = await State.dexieDB.episodes.where({ podcast_id: id }).filter(ep => {
      return ep.queue > 0
    }).toArray()

    for (let eiq of episodesInQueue) {
      await QueueModel.removeFromQueue(eiq._id)
    }
    await State.dexieDB.podcasts.where({ _id: id }).delete()

    let episodes = await PodcastModel.getEpisodes(id)

    let removePodcastEpisodes = []
    for (let ep of episodes) {
      removePodcastEpisodes.push(State.dexieDB.episodes.where({ _id: ep._id }).delete())

      if (await localforage.getItem('podrain_episode_'+ep._id)) {
        await localforage.removeItem('podrain_episode_'+ep._id)
      }
    }

    await Promise.all([...removePodcastEpisodes])

    this.deleting = false
    m.route.set('/podcasts')
  }
}

export default PodcastShowModel
