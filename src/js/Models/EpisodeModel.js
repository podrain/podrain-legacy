import State from '../State'

let EpisodeModel = {
  async getEpisode(id) {
    return await State.db.get(id)
  }
}

export default EpisodeModel