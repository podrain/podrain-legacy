import m from 'mithril'
import QueueModel from '../Models/QueueModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'

class QueueList {
  view() {
    return [
      m('ul.text-white.m-3', QueueModel.queue.map((ep, index) => {
        return m('li.p-3', {
          class: [
            index != 0 ? 'mt-3' : '',
            ep.currently_playing ? 'bg-orange-500' : 'bg-gray-700'
          ].join(' '),
          onclick() {
            EpisodeCurrentlyPlaying.playEpisode(ep._id)
          }
        }, [
          m('.leading-tight.text-xs.font-bold', ep.title),
          m('.flex.mt-3', [
            m('.w-1/5', m('img', { src: ep.imageURL })),
            m('.w-4/5.text-xs.font-light.ml-3', ep.description ? (ep.description.length > 125 ? ep.description.substr(0, 125) + '...' : ep.description) : 'No description provided')
          ])
        ])
      }))
    ]
  }
}

export default QueueList
