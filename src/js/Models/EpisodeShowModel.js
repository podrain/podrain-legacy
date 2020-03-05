import State from '../State'
import EpisodeModel from './EpisodeModel'

let EpisodeShowModel = {
  episode: null,
  loading: false,

  async getEpisode(id) {
    this.loading = true
    this.episode = await EpisodeModel.getEpisode(id)
    this.loading = false
  }
}

export default EpisodeShowModel