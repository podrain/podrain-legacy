import State from '../State'

let PodcastModel = {
  async getPodcast(id) {
    return (await State.dexieDB.podcasts.where({ _id: id }).toArray())[0]
  },

  async getEpisodes(id) {
    return await State.dexieDB.episodes.where({ podcast_id: id }).toArray()
  }
}

export default PodcastModel