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
        podcasts.length > 0 ?
        m('.flex.flex-wrap', podcasts.map((pc) => {
          return m('.w-1/3.flex-none', [
            m('img', {
              src: pc.meta.imageURL,
              onclick() {
                m.route.set('/podcasts/'+pc._id)
              }
            })
          ])
        })) : m('.flex.flex-col.h-full.justify-center.items-center', [
          m('h2.text-white', 'No podcasts.'),
          m('button.bg-green-500.mt-3.p-2.text-white', {
            onclick() {
              m.route.set('/podcasts/add')
            }
          }, 'Add some!')
        ])
      ]
    }
  }
}

export default PodcastList
