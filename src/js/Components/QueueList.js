import m from 'mithril'
import QueueModel from '../Models/QueueModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'

class QueueList {
  view() {
    return [
      m('ul.text-white.m-3', QueueModel.queue.map((ep, index) => {
        return m('li.p-3.relative', {
          class: [
            index != 0 ? 'mt-3' : '',
            ep.currently_playing ? 'bg-orange-500' : 'bg-gray-700'
          ].join(' '),
          onclick() {
            EpisodeCurrentlyPlaying.playEpisode(ep._id, true)
          }
        }, [
          ep.played ? m('.w-8.h-8.bg-yellow-500.absolute.bottom-0.left-0.flex.justify-center.items-center', [
            m('i.fas.fa-check.text-black')
          ]) : null,
          m('.leading-tight.text-xs.font-bold', ep.title),
          m('.flex.mt-3', [
            m('.w-1/5', m('img', { src: ep.imageURL || ep.podcast.meta.imageURL })),
            m('.w-4/5.text-xs.font-light.ml-3', ep.description ? (ep.description.length > 125 ? ep.description.substr(0, 125) + '...' : ep.description) : 'No description provided')
          ])
        ])
      }))
    ]
  }
}

export default QueueList
