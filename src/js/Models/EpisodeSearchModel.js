import State from '../State'
import _ from 'lodash'

let EpisodeSearchModel = {
  episodes: [],
  podcast: {},
  searchResults: [],
  loading: false,

  async fetchPodcast(id) {
    this.podcast = await State.db.get(id)
  },

  async fetchEpisodes(id) {
    this.episodes = (await State.db.find({
      selector: {
        type: 'episode',
        podcast_id: id
      }
    })).docs
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