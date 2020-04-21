import State from '../State'
import localforage from 'localforage'
import m from 'mithril'
import _ from 'lodash'

let EpisodeModel = {
  downloading: [],

  async getEpisode(id) {
    return (await State.dexieDB.episodes.where({ _id: id }).toArray())[0]
  },

  async downloadEpisode(id) {
    this.downloading.push({
      id: id,
      progress: 0
    })
    let episode = (await State.dexieDB.episodes.where({ _id: id }).toArray())[0]
    let proxyUrl = localStorage.getItem('proxy_url') || ""

    let episodeAudio = await m.request(proxyUrl + episode.enclosure.url, {
      extract: function(xhr) {
        return xhr
      },
      config: function(xhr) {
        xhr.onprogress = function(event) {
          let episodeDownloading = EpisodeModel.downloading.filter(ed => ed.id == id)[0]
          let episodeIndex = EpisodeModel.downloading.indexOf(episodeDownloading)
          EpisodeModel.downloading[episodeIndex].progress = Math.floor((event.loaded / event.total) * 100)
          m.redraw()
        }
      },
      headers: {
        'Accept': 'audio/*'
      },
      responseType: 'arraybuffer'
    })

    // Save blob strategy
    let audioType = episodeAudio.getResponseHeader('content-type')
    let audioBlob = new Blob([episodeAudio.response], {type: audioType})
    await localforage.setItem('podrain_episode_'+id, audioBlob)

    // Save as arraybuffer strategy
    // await localforage.setItem('podrain_episode_'+id, episodeAudio.response)
    
    let episodeDownloading = EpisodeModel.downloading.filter(ed => ed.id == id)[0]
    let episodeIndex = EpisodeModel.downloading.indexOf(episodeDownloading)
    await this.syncDownloadedEpisodes()
    this.downloading.splice(episodeIndex, 1)

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