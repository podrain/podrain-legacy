import m from 'mithril'
import PodcastShowModel from '../Models/PodcastShowModel'
import QueueModel from '../Models/QueueModel'

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
        return m('li.flex.flex-col', {
          class: index != 0 ? 'mt-3' : ''
        }, [
          m('.flex-1.p-3.bg-gray-700.relative', [
            ep.played ? m('.w-8.h-8.bg-yellow-500.absolute.bottom-0.left-0.flex.justify-center.items-center', [
              m('i.fas.fa-check.text-black')
            ]) : null,
            m('.leading-tight.text-xs.font-bold', ep.title),
            m('.flex.mt-3', [
              m('.w-1/5', m('img', { src: ep.imageURL || PodcastShowModel.podcast.meta.imageURL })),
              m('.w-4/5.text-xs.font-light.ml-3', ep.description ? (ep.description.length > 125 ? ep.description.substr(0, 125) + '...' : ep.description) : 'No description provided')
            ])
          ]),
          m('.h-8.flex.justify-center.items-center', {
            class: ep.queue ? 'bg-red-500' : 'bg-green-500',
            onclick() {
              if (ep.queue) {
                QueueModel.removeFromQueue(ep._id).then(() => {
                  return PodcastShowModel.getEpisodes(PodcastShowModel.podcast._id)
                })
              } else {
                QueueModel.addToQueue(ep._id).then(() => {
                  return PodcastShowModel.getEpisodes(PodcastShowModel.podcast._id)
                })
              }
            }
          }, [
            ep.queue ? [m('i.fas.fa-minus.mr-3'),'Remove from queue'] : [m('i.fas.fa-plus.mr-3'),'Add to queue']
          ])
        ])
      }))
    ]
  }
}

export default PodcastShow
