import State from '../State'

let PodcastModel = {
  async getPodcast(id) {
    return await State.db.get(id)
  },

  async getEpisodes(id) {
    return (await State.db.find({
      selector: {
        podcast_id: id,
        type: 'episode',
      },
      limit: 99999
    })).docs
  }
}

export default PodcastModel