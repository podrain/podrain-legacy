import m from 'mithril'
import Helpers from '../Helpers'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import QueueModel from '../Models/QueueModel'
import EpisodeModel from '../Models/EpisodeModel'
import _ from 'lodash'

function Episode(vnode) {
  
  function cleanHTML(str) {
    return Helpers.cleanHTMLString(str)
  }

  return {
    view(vnode) {
      return [
        <li 
          class="flex flex-col mt-3"
          key={vnode.attrs.episode._id}
        >
          <div 
            class={`flex1 p-3 relative ${vnode.attrs.episode.currently_playing ? 'bg-orange-500' : 'bg-gray-700'}`}
            onclick={() => {
              m.route.set('/episodes/'+vnode.attrs.episode._id)
            }}
          >
            {vnode.attrs.episode.played &&
            <div class="w-8 h-8 bg-yellow-500 absolute bottom-0 left-0 flex justify-center items-center">
              <i class="fas fa-check text-black"></i>
            </div>
            }

            <div class="leading-tight text-xs font-bold truncate">{vnode.attrs.episode.title}</div>
            <div class="flex mt-3">
              <div class="w-1/5">
                <img src={vnode.attrs.episode.imageURL || vnode.attrs.alternateImageURL } />
              </div>
              <div class="w-4/5 text-xs font-light ml-3">
                {
                  cleanHTML(vnode.attrs.episode.description) ? (
                    cleanHTML(vnode.attrs.episode.description).length > 125 ?
                    cleanHTML(vnode.attrs.episode.description).substr(0, 125) + '...'
                    :
                    cleanHTML(vnode.attrs.episode.description)
                  ) : 'No description provided.'
                }
              </div>
            </div>
          </div>

          <div class="flex h-8 w-full">
            <button 
              class="w-1/4 flex justify-center items-center bg-blue-500"
              onclick={() => {
                EpisodeCurrentlyPlaying.playEpisode(vnode.attrs.episode._id, true)
              }}
            >
              {
                !EpisodeCurrentlyPlaying.audio.paused
                && EpisodeCurrentlyPlaying.episode._id == vnode.attrs.episode._id ? 
                  <i class="fas fa-pause"></i>
                :
                  <i class="fas fa-play"></i>
              }
            </button>

            <button 
              class={`w-3/4 flex justify-center items-center ${vnode.attrs.episode.queue ? 'bg-red-500' : 'bg-green-500'}`}
              onclick={() => {
                let method = null
  
                if (vnode.attrs.episode.queue) {
                  method = QueueModel.removeFromQueue(vnode.attrs.episode._id)
                } else {
                  method = QueueModel.addToQueue(vnode.attrs.episode._id)
                }
  
                method.then(() => {
                  return EpisodeModel.getEpisode(vnode.attrs.episode._id)
                }).then(updatedEpisode => {
                  let episodeIndex = _.findIndex(vnode.attrs.partOf, (fep) => {
                    return fep._id == vnode.attrs.episode._id
                  })
                  vnode.attrs.partOf[episodeIndex] = updatedEpisode
                })
              }}
              disabled={QueueModel.queueChanging}
            >
              {
                QueueModel.queueChanging ?
                  <i class="fas fa-spinner fa-spin"></i>
                :
                  vnode.attrs.episode.queue ?
                    <div>
                      <i class="fas fa-minus mr-3"></i>
                      Remove from Queue
                    </div>
                  :
                    <div>
                      <i class="fas fa-plus mr-3"></i>
                      Add to Queue
                    </div>
              }
            </button>
          </div>
        </li>
      ]
    }
  }
}

export default Episode