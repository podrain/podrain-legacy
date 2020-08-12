import m from 'mithril'
import Episode from './Episode'
import _ from 'lodash'
import State from '../State'

function EpisodeSearch() {
  let episodes = []
  let podcast = {}
  let searchResults = []
  let loading = false

  async function fetchPodcast(id) {
    podcast = (await State.dexieDB.podcasts.where({ _id: id }).toArray())[0]
  }

  async function fetchEpisodes(id) {
    episodes = await State.dexieDB.episodes.where({ podcast_id: id }).toArray()
  }

  let searchEpisodes = _.debounce(function (search) {
    searchResults = episodes.filter(ep => {
      let lowerCaseDesc = ep.description.toLowerCase()
      let lowerCaseTitle = ep.title.toLowerCase()
      return lowerCaseDesc.includes(search.toLowerCase()) || lowerCaseTitle.includes(search.toLowerCase())
    })
  }, 1000)

  return {
    oninit(vnode) {
      loading = true
      episodes = []
      searchResults = []
      let getPodcastPromise = fetchPodcast(vnode.attrs.id)
      let getEpisodesPromise = fetchEpisodes(vnode.attrs.id)

      Promise.all([getPodcastPromise, getEpisodesPromise]).then(() => {
        loading = false
      })
    },

    view() {
      return loading 
      ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
      : m('.p-3', [
          m('h1.text-white', [
            'Search episodes in ',
            m('span.italic', podcast.meta.title)
          ]),
          m('input.p-1.w-full.mt-1', {
            oninput(e) {
              searchEpisodes(e.target.value)
            }
          }),
          m('ul.text-white.m-3', searchResults.map((ep) => {
            return m(Episode, {
              episode: ep,
              partOf: searchResults
            })
          })),
        ])
    }
  }
}

export default EpisodeSearch