import State from '../State'
import EpisodeModel from './EpisodeModel'
import PodcastModel from './PodcastModel'

let EpisodeShowModel = {
  episode: {},
  podcast: {},
  loading: false,

  async getEpisode(id) {
    this.loading = true
    this.episode = await EpisodeModel.getEpisode(id)
    this.loading = false
  }
}

export default EpisodeShowModel