import m from 'mithril'
import State from '../State'

function PodcastList() {
  let podcasts = []
  let loading = false

  function getPodcasts() {
    loading = true

    State.dexieDB.podcasts.toArray().then(result => {
      podcasts = result
      loading = false
    })
  }

  return {
    oninit() {
      getPodcasts()
    },

    view() {
      return loading
      ? <div class="flex text-white text-5xl h-full justify-center items-center">Loading...</div>
      : 
        podcasts.length > 0 ?
        <div class="flex flex-wrap">
          {podcasts.map((pc) => (
            <div class="w-1/3 flex-none">
              <img 
                src={pc.meta.imageURL}
                onclick={() => {
                  m.route.set('/podcasts/'+pc._id)
                }}
              />
            </div>
          ))}
        </div>
        : 
        <div class="flex flex-col h-full justify-center items-center">
          <h2 class="text-white">No podcasts.</h2>
          <button 
            class="bg-green-500 mt-3 p-2 text-white"
            onclick={() => { 
              m.route.set('/podcasts/add') 
            }}
          >Add some!</button>
        </div>
    }
  }
}

export default PodcastList
