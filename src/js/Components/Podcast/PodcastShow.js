import m from 'mithril'
import PodcastShowModel from '../../Models/PodcastShowModel'

class PodcastShow {
  view() {
    return PodcastShowModel.loading
    ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
    : [
      m('.flex', [
        m('.w-1/3.m-3', [
          m('img', {
            src: PodcastShowModel.podcast.meta.imageURL
          })
        ]),
        m('.w-2/3.flex.justify-center.items-center.text-lg', [
          m('h1.text-white.font-bold.leading.snug', PodcastShowModel.podcast.meta.title)
        ])
      ]),
      m('ul.text-white.mx-3.mb-3', PodcastShowModel.episodes.map((ep, index) => {
        return m('li.p-3.bg-gray-700', {
          class: index != 0 ? 'mt-3' : ''
        }, [
          m('.leading-tight.text-xs.font-bold', ep.title),
          m('.flex.mt-3', [
            m('.w-1/5', m('img', { src: ep.imageURL || PodcastShowModel.podcast.meta.imageURL })),
            m('.w-4/5.text-xs.font-light.ml-3', ep.description ? (ep.description.length > 125 ? ep.description.substr(0, 125) + '...' : ep.description) : 'No description provided')
          ])
        ])
      }))
    ]
  }
}

export default PodcastShow
