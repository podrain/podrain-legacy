import m from 'mithril'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import State from '../State'
import Helpers from '../Helpers'
import Episode from './Episode'

function PlayBox() {
  let expanded = true

  return {
    oninit() {
      EpisodeCurrentlyPlaying.audio = new Audio
  
      setInterval(() => {
        EpisodeCurrentlyPlaying.updatePlayhead()
      }, 1000)
  
      setInterval(() => {
        EpisodeCurrentlyPlaying.updatePlayhead(true)
      }, 5000)
  
      EpisodeCurrentlyPlaying.audio.addEventListener('ended', async () => {
        await EpisodeCurrentlyPlaying.playNext(true, true)
      })
  
      // Get currently playing episode if available
  
      State.dexieDB.episodes
        .filter(ep => ep.currently_playing == true)
        .toArray().then(result => {
          return EpisodeCurrentlyPlaying.playEpisode(result[0]._id)
        })
    },
  
    view() {
      return EpisodeCurrentlyPlaying &&
        expanded ?
          <div class="h-48 bg-gray-200">
            {
              EpisodeCurrentlyPlaying.loading ?
                <div class="h-full flex justify-center items-center">
                  <i class="fas fa-spinner fa-spin text-6xl"></i>
                </div>
              : 
                <div class="p-3 h-full flex flex-col justify-between">
                  <div class="flex justify-between">
                    <div class="flex flex-col w-4/5">
                      <div class="w-full text-gray-800 text-sm">
                        {EpisodeCurrentlyPlaying.episode.podcast.meta.title}
                      </div>
                      <div class="w-full whitespace-no-wrap overflow-x-hidden">
                        <marquee scrollamount="4">
                          {EpisodeCurrentlyPlaying.episode.title}
                        </marquee>
                      </div>
                    </div>
                    <div class="flex justify-end items-start w-1/5">
                      <i 
                        class="fas fa-chevron-down text-4xl"
                        onclick={() => {
                          expanded = false
                        }}
                      ></i>
                    </div>
                  </div>
  
                  <div class="flex justify-between">
                    <i 
                      class="fas fa-step-backward text-4xl"
                      onclick={() => {
                        EpisodeCurrentlyPlaying.playPrev()
                      }}
                    ></i>
                    <i 
                      class="fas fa-undo text-4xl"
                      onclick={() => {
                        EpisodeCurrentlyPlaying.jumpBack()
                      }}
                    ></i>
                    <i 
                      class={`fas text-teal-500 text-4xl ${EpisodeCurrentlyPlaying.audio && EpisodeCurrentlyPlaying.audio.paused ? 'fa-play' : 'fa-pause'}`}
                      onclick={() => {
                        EpisodeCurrentlyPlaying.playOrPause()
                      }}
                    ></i>
                    <i 
                      class="fas fa-redo text-4xl"
                      onclick={() => {
                        EpisodeCurrentlyPlaying.jumpAhead()
                      }}
                    ></i>
                    <i 
                      class="fas fa-step-forward text-4xl"
                      onclick={() => {
                        EpisodeCurrentlyPlaying.playNext()
                      }}
                    ></i>
                  </div>
  
                  <div>
                    {
                      Helpers.floatToISO(EpisodeCurrentlyPlaying.playhead) 
                      + ' / ' 
                      + (EpisodeCurrentlyPlaying.episode ? Helpers.floatToISO(EpisodeCurrentlyPlaying.episode.duration) : '00:00:00')
                    }
                  </div>
                  <div>
                    <div class="flex items-center justify-between">
                      <div class="relative w-full">
                        <input 
                          id="play-slider"
                          class="w-full appearance-none bg-gray-200"
                          type="range"
                          min="0"
                          max={EpisodeCurrentlyPlaying.episode.duration || 0}
                          value={EpisodeCurrentlyPlaying.playhead || 0}
                          onchange={() => {
                            EpisodeCurrentlyPlaying.setPlayhead(e.target.value)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
            }
          </div>
        :
          <div 
            class="h-12 bg-gray-200 flex items-center justify-center"
            onclick={() => {
              expanded = true
            }}
          >
            <i class="fas fa-chevron-up text-4xl"></i>
          </div>
    }
  }
}

export default PlayBox
