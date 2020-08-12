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
      ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
      : [
        m('.flex.flex-wrap', podcasts.map((pc) => {
          return m('.w-1/3.flex-none', [
            m('img', {
              src: pc.meta.imageURL,
              onclick() {
                m.route.set('/podcasts/'+pc._id)
              }
            })
          ])
        }))
      ]
    }
  }
}

export default PodcastList
