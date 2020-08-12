import m from 'mithril'
import Episode from './Episode'
import State from '../State'
import feedParser from 'better-podcast-parser'
import localforage from 'localforage'
import uuidv4 from 'uuid/v4'
import PodcastModel from '../Models/PodcastModel'
import QueueModel from '../Models/QueueModel'

function PodcastShow() {
  let podcast = {}
  let episodes = []
  let allEpisodes = []
  let loading = false
  let refreshing = false
  let deleting = false

  async function getPodcast(id) {
    podcast = await PodcastModel.getPodcast(id)
  }

  async function getEpisodes(id) {
    let episodes = await State.dexieDB.episodes.where({
      podcast_id: id
    }).reverse().sortBy('pubDate')

    allEpisodes = episodes
    episodes = allEpisodes.slice(0, 10)
  }

  async function getMoreEpisodes(id, numEpisodes) {
    let newBatch = allEpisodes.slice(episodes.length, episodes.length + numEpisodes)
    episodes = episodes.concat(newBatch)
  }

  async function refreshEpisodes(id) {
    refreshing = true
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
    refreshing = false
  }

  async function deletePodcast(id) {
    deleting = true
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

    deleting = false
    m.route.set('/podcasts')
  }

  return {
    oninit(vnode) {
      loading = true

      let getPodcasts = getPodcast(vnode.attrs.id)
      let getEpisodes = getEpisodes(vnode.attrs.id)

      Promise.all([getPodcasts, getEpisodes]).then(() => {
        loading = false
      })
    },

    view() {
      return loading
      ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
      : m('.flex.flex-col', [
        m('.flex', [
          m('.w-1/3.m-3', [
            m('img', {
              src: podcast.meta.imageURL
            })
          ]),
          m('.w-2/3.flex.flex-col.justify-center.text-lg.py-3.pr-3', [
            m('h1.text-white.font-bold.leading.snug', podcast.meta.title),
            m('.mt-3.flex-col', [
              m('.flex', [
                m('button.text-white.bg-indigo-500.p-2.text-sm.flex-1', {
                  onclick() {
                    refreshEpisodes(podcast._id).then(() => {
                      getEpisodes(podcast._id)
                    })
                  }
                }, [
                  m('i.fas.fa-sync-alt.mr-3', {
                    class: refreshing ? 'fa-pulse' : ''
                  }),
                  'Refresh'
                ]),
                m('button.text-white.bg-red-500.p2.text-sm.flex-1', {
                  onclick() {
                    deletePodcast(podcast._id)
                  }
                }, [
                  m('i.fas.mr-3', {
                    class: deleting ? 'fa-spinner fa-spin' : 'fa-times'
                  }),
                  'Delete'
                ])
              ]),
              m('button.bg-yellow-500.p-2.text-sm.w-full', {
                onclick() {
                  m.route.set('/podcasts/'+podcast._id+'/search')
                }
              }, [
                m('i.fas.fa-search.mr-3'),
                'Search episodes'
              ])
            ])
          ])
        ]),
        m('ul.text-white.mx-3.mb-3', episodes.map((ep, index) => {
          return m(Episode, {
            episode: ep,
            alternateImageURL: podcast.meta.imageURL,
            partOf: episodes
          })
        })),
        m('button.bg-purple-500.text-white.mx-3.mb-3.p-3', {
          onclick() {
            getMoreEpisodes(podcast._id, 10)
          }
        }, 'Load more')
      ])
    }
  }
}

export default PodcastShow
