import m from 'mithril'
import QueueModel from '../Models/QueueModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import Sortable from 'sortablejs'
import EpisodeModel from '../Models/EpisodeModel'

class QueueList {
  oncreate() {
    let queueList = document.getElementById('queue-list')
    let sortable = Sortable.create(queueList, {
      handle: '.queue-dragbar',
      scroll: true,
      animation: 150,

      onUpdate(evt) {
        let newOrder = evt.newIndex + 1
        let episodeID = evt.item.dataset.id
        QueueModel.reorder(episodeID, newOrder)
      }
    })
  }

  view() {
    return [
      m('ul#queue-list.text-white.mt-3.mx-3', QueueModel.queue.map((ep, index) => {
        return m('li.flex.flex-col', {
          class: [
            'mb-3',
          ].join(' '),
          'data-id': ep._id,
          key: ep._id
        }, [
          m('.flex', {
            class: ep.currently_playing ? 'bg-orange-500' : 'bg-gray-700',
          }, [
            m('.p-3.relative.w-full', {
              onclick() {
                EpisodeCurrentlyPlaying.playEpisode(ep._id, true)
              },
            }, [
              ep.played ? m('.w-8.h-8.bg-yellow-500.absolute.bottom-0.left-0.flex.justify-center.items-center', [
                m('i.fas.fa-check.text-black')
              ]) : null,
              m('.leading-tight.text-xs.font-bold', ep.title),
              m('.flex.mt-3', [
                m('.w-1/5', m('img', { src: ep.imageURL || ep.podcast.meta.imageURL })),
                m('.w-4/5.text-xs.font-light.ml-3', ep.description ? (ep.description.length > 125 ? ep.description.substr(0, 125) + '...' : ep.description) : 'No description provided')
              ])
            ]),
            m('.queue-dragbar.w-10.bg-indigo-500.flex.items-center.justify-center', [
              m('i.fas.fa-bars')
            ]),
          ]),
          m('.h-8.flex', [
            m('.flex-1.flex.justify-center.items-center', {
              class: 'bg-red-500',
              onclick() {
                QueueModel.removeFromQueue(ep._id)
              }
            }, [
              m('i.fas.fa-minus.mr-3'),'Remove'
            ]),
            m('.flex-1.flex.justify-center.items-center', {
              class: 'bg-blue-500',
              onclick() {
                EpisodeModel.downloadEpisode(ep._id)
              }
            }, [
              m('i.fas.fa-download.mr-3'),
              'Download'
            ])
          ]),
        ])
      }))
    ]
  }
}

export default QueueList
