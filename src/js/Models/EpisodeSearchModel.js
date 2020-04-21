import State from '../State'
import _ from 'lodash'

let EpisodeSearchModel = {
  episodes: [],
  podcast: {},
  searchResults: [],
  loading: false,

  async fetchPodcast(id) {
    this.podcast = (await State.dexieDB.podcasts.where({ _id: id }).toArray())[0]
  },

  async fetchEpisodes(id) {
    this.episodes = await State.dexieDB.episodes.where({ podcast_id: id }).toArray()
  },

  searchEpisodes: _.debounce(function(search) {
    this.searchResults = this.episodes.filter(ep => {
      let lowerCaseDesc = ep.description.toLowerCase()
      let lowerCaseTitle = ep.title.toLowerCase()
      return lowerCaseDesc.includes(search.toLowerCase()) || lowerCaseTitle.includes(search.toLowerCase())
    })
  }, 250),
}

export default EpisodeSearchModel