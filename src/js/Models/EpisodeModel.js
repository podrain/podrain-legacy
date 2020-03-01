import State from '../State'
import localforage from 'localforage'
import m from 'mithril'
import _ from 'lodash'

let EpisodeModel = {
  async getEpisode(id) {
    return await State.db.get(id)
  },

  async downloadEpisode(id) {
    let episode = await State.db.get(id)
    let proxyUrl = 'https://example.com/'

    let episodeAudio = await m.request(proxyUrl + episode.enclosure.url, {
      extract: function(xhr) {
        return xhr
      },
      responseType: 'arraybuffer'
    })

    let audioType = episodeAudio.getResponseHeader('content-type')
    let audioBlob = new Blob([episodeAudio.response], {type: audioType})
    await localforage.setItem('podrain_episode_'+id, audioBlob)

    // let audioSrcUrl = window.URL.createObjectURL(audioBlob)
    // let audio = new Audio
    // audio.src = audioSrcUrl
    // audio.load()
    // audio.play()
  },

  async isDownloaded(id) {
    let lfKeys = await localforage.keys()
    let downloadedAudioKey = 'podrain_episode_'+id
    return lfKeys.includes(downloadedAudioKey)
  }
}

export default EpisodeModel