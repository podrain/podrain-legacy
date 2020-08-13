import m from 'mithril'
import QueueModel from '../Models/QueueModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import Sortable from 'sortablejs'
import EpisodeModel from '../Models/EpisodeModel'
import Helpers from '../Helpers'

class QueueList {
  oncreate() {
    let queueList = document.getElementById('queue-list')
    let sortable = Sortable.create(queueList, {
      handle: '.queue-dragbar',
      scroll: true,
      animation: 150,

      onUpdate(evt) {
        QueueModel.queueChanging = true
        m.redraw()
        let newOrder = evt.newIndex + 1
        let episodeID = evt.item.dataset.id
        QueueModel.reorder(episodeID, newOrder)
      }
    })
  }

  view() {
    return (
      <ul id="queue-list" class="text-white mt-3 mx-3">
        {QueueModel.queue.map((ep, index) => 
          <li 
            class="flex flex-col mb-3"
            data-id={ep._id}
            key={ep._id}
          >
            <div class={`flex ${ep.currently_playing ? 'bg-orange-500' : 'bg-gray-700'}`}>
              <div 
                class="p-3 relative w-full"
                onclick={() => {
                  EpisodeCurrentlyPlaying.playEpisode(ep._id, true)
                }}
              >
                {
                  ep.played &&
                    <div class="w-8 h-8 bg-yello-500 absolute bottom-0 left-0 flex justify-center items-center">
                      <i class="fas fa-check text-black"></i>
                    </div>
                }

                <div class="leading-tight text-xs font-bold">{ep.title}</div>
                <div class="flex mt-3">
                  <div class="w-1/5">
                    <img src={ep.imageURL || ep.podcast.meta.imageURL} />
                  </div>
                  <div class="w-4/5 text-xs font-light ml-3">
                    {
                      ep.description ? 
                        (Helpers.cleanHTMLString(ep.description).length > 125 ? 
                          Helpers.cleanHTMLString(ep.description).substr(0, 125) + '...' 
                        : 
                          Helpers.cleanHTMLString(ep.description)) 
                      : 'No description provided'
                    }
                  </div>
                </div>
              </div>
              <div class="queue-dragbar w-10 bg-indigo-500 flex items-center justify-center">
                  {
                    QueueModel.queueChanging ?
                      <i class="fas fa-spinner fa-spin"></i>
                    :
                      <i class="fas fa-bars"></i>
                  }
                </div>
            </div>

            <div class="h-8 flex">
              <button 
                class="flex-1 flex justify-center items-center bg-red-500"
                onclick={() => {
                  QueueModel.removeFromQueue(ep._id)
                }}
                disabled={QueueModel.queueChanging}
              >
                {
                  QueueModel.queueChanging ?
                    <i class="fas fa-spinner fa-spin"></i>
                  :
                    <div>
                      <i class="fas fa-minus mr-3"></i>
                      Remove
                    </div>
                }
              </button>

              <div 
                class="flex-1 relative bg-blue-500"
                onclick={() => {
                  if (EpisodeModel.isDownloaded(ep._id)) {
                    EpisodeModel.removeDownload(ep._id)
                  } else {
                    EpisodeModel.downloadEpisode(ep._id)
                  }
                }}
              >
                <div 
                  class="h-full bg-green-500 absolute"
                  style={'width: ' + (
                    EpisodeModel.isDownloaded(ep._id) ? 
                      '100' 
                    : (EpisodeModel.downloading.map(dl => dl.id).includes(ep._id) ? 
                        EpisodeModel.downloading.filter(dl => dl.id == ep._id)[0].progress 
                      : 
                        '0'
                      )
                    ) + '%;' 
                  }
                ></div>
                <div class="flex h-full justify-center items-center relative">
                  {
                    EpisodeModel.isDownloaded(ep._id) ?
                      <div>
                        <i class="fas fa-check mr-3"></i>
                        Downloaded
                      </div>
                    :
                      EpisodeModel.downloading.map(dl => dl.id).includes(ep._id) ?
                        'Downloading...'
                      :
                        <div>
                          <i class="fas fa-download mr-3"></i>
                          Download
                        </div>
                  }
                </div>
              </div>
            </div>
          </li>
        )}
      </ul>
    )
  }
}

export default QueueList
