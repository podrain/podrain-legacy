import m from 'mithril'
import EpisodeModel from '../Models/EpisodeModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'

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
      ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
      : [
        m('.p-3', [
          m('h1.text-white.text.text-xl', episode.title),
          m('.flex.mt-3', [
            m('button.bg-green-500.text-white.w-full.p-3', {
              onclick() {
                EpisodeCurrentlyPlaying.playEpisode(episode._id, true)
              }
            }, [
              m('i.fas.fa-play.mr-3'),
              'Play'
            ])
          ]),
          m('.markdown.text-gray-300.leading-snug.mt-3.text-sm', m.trust(episode.description))
        ])
      ]
    }
  }
}

export default EpisodeShow