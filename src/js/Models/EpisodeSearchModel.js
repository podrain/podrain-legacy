import State from '../State'

let EpisodeSearchModel = {
  episodes: [],
  podcast: {},
  searchResults: [],

  async fetchPodcast(id) {
    this.podcast = await State.db.get(id)
    console.log(this.podcast)
  },

  async fetchEpisodes(id) {
    this.episodes = (await State.db.find({
      selector: {
        type: 'episode',
        podcast_id: id
      }
    })).docs
    console.log(this.episodes)
  },

  searchEpisodes(search) {
    this.searchResults = this.episodes.filter(ep => {
      let lowerCaseDesc = ep.description.toLowerCase()
      let lowerCaseTitle = ep.title.toLowerCase()
      return lowerCaseDesc.includes(search) || lowerCaseTitle.includes(search)
    })
  }
}

export default EpisodeSearchModel