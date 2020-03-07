import State from '../State'

let PodcastModel = {
  async getPodcast(id) {
    return await State.db.get(id)
  }
}

export default PodcastModel