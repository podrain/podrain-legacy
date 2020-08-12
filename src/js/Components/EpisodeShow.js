import m from 'mithril'
import EpisodeModel from '../Models/EpisodeModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import { divide } from 'lodash'

function EpisodeShow() {
  let episode = {}
  let podcast = {}
  let loading = false

  async function getEpisode(id) {
    loading = true
    episode = await EpisodeModel.getEpisode(id)
    loading = false
  }

  return {
    oninit(vnode) {
      getEpisode(vnode.attrs.id)
    },

    view() {
      return loading
      ? 
      <div class="flex text-white text-5xl h-full justify-center items-center">Loading...</div>
      : 
      <div class="p-3">
        <h1 class="text-white text-xl">{episode.title}</h1>
        <div class="flex mt-3">
          <button class="bg-green-500 text-white w-full p-3">
            <i class="fas fa-play mr-3"></i>
            Play
          </button>
        </div>
        <div class="markdown text-gray-300 leading-snug mt-3 text-sm">
          {m.trust(episode.description)}
        </div>
      </div>
    }
  }
}

export default EpisodeShow