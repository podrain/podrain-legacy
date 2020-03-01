import State from '../State'
import localforage from 'localforage'
import m from 'mithril'
import _ from 'lodash'

let EpisodeModel = {
  downloading: [],

  async getEpisode(id) {
    return await State.db.get(id)
  },

  async downloadEpisode(id) {
    this.downloading.push(id)
    let episode = await State.db.get(id)
    let proxyUrl = 'https://example.com/'

    let episodeAudio = await m.request(proxyUrl + episode.enclosure.url, {
      extract: function(xhr) {
        return xhr
      },
      responseType: 'arraybuffer'
    })

    // let audioType = episodeAudio.getResponseHeader('content-type')
    // let audioBlob = new Blob([episodeAudio.response], {type: audioType})
    await localforage.setItem('podrain_episode_'+id, episodeAudio.response)
    
    await this.syncDownloadedEpisodes()
    this.downloading.splice(this.downloading.indexOf(id), 1)


    // let audioSrcUrl = window.URL.createObjectURL(audioBlob)
    // let audio = new Audio
    // audio.src = audioSrcUrl
    // audio.load()
    // audio.play()
  },

  async removeDownload(id) {
    await localforage.removeItem('podrain_episode_'+id)
    await this.syncDownloadedEpisodes()
  },

  isDownloaded(id) {
    return State.downloadedEpisodes.includes(id)
  },

  syncDownloadedEpisodes() {
    return localforage.keys().then(keys => {
      let episodes = keys.filter(key => {
        return key.includes('podrain_episode_')
      }).map(key => {
        return key.substr('podrain_episode_'.length)
      })
    
      State.downloadedEpisodes = episodes
      m.redraw()
    })
  }
}

export default EpisodeModel