import m from 'mithril'
import Episode from './Episode'
import _ from 'lodash'
import Loading from './Loading'
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
      return loading ?
        <Loading />
      :
        <div class="p-3">
          <h1 class="text-white">Search episodes in <span class="italic">{podcast.meta.title}</span></h1>
          <input 
            class="p-1 w-full mt-1"
            oninput={(e) => {
              searchEpisodes(e.target.value)
            }}
          />
          <ul class="text-white">
            {searchResults.map((ep) => 
              <Episode 
                episode={ep}
                alternateImageURL={podcast.meta.imageURL}
                partOf={searchResults}
              />
            )}
          </ul>
        </div>
    }
  }
}

export default EpisodeSearch