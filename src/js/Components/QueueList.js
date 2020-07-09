import m from 'mithril'
import QueueModel from '../Models/QueueModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import Sortable from 'sortablejs'
import EpisodeModel from '../Models/EpisodeModel'
import Helpers from '../Helpers'
import Icon from './Icon'

class QueueList {
  oncreate() {
    let queueList = document.getElementById('queue-list')
    let sortable = Sortable.create(queueList, {
      handle: '.queue-dragbar',
      scroll: true,
      animation: 150,

      onUpdate(evt) {
        QueueModel.queueChanging = true
        m.redraw()
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
                m(Icon, {
                  icon: 'check',
                  class: 'text-black'
                })
              ]) : null,
              m('.leading-tight.text-xs.font-bold', ep.title),
              m('.flex.mt-3', [
                m('.w-1/5', m('img', { src: ep.imageURL || ep.podcast.meta.imageURL })),
                m('.w-4/5.text-xs.font-light.ml-3', ep.description 
                  ? (Helpers.cleanHTMLString(ep.description).length > 125 
                    ? Helpers.cleanHTMLString(ep.description).substr(0, 125) + '...' 
                    : Helpers.cleanHTMLString(ep.description)) 
                  : 'No description provided')
              ])
            ]),
            m('.queue-dragbar.w-10.bg-indigo-500.flex.items-center.justify-center', [
              QueueModel.queueChanging ? m(Icon, { icon: 'spinner' }) : m(Icon, { icon: 'bars' })
            ]),
          ]),
          m('.h-8.flex', [
            m('button.flex-1.flex.justify-center.items-center', {
              class: 'bg-red-500',
              onclick() {
                QueueModel.removeFromQueue(ep._id)
              },
              disabled: QueueModel.queueChanging
            }, QueueModel.queueChanging ? m(Icon, { icon: 'spinner', class: 'mr-3' }) : [
              m(Icon, { icon: 'minus', class: 'mr-3' }),'Remove'
            ]),
            m('.flex-1.relative', {
              class: 'bg-blue-500',
              onclick() {
                if (EpisodeModel.isDownloaded(ep._id)) {
                  EpisodeModel.removeDownload(ep._id)
                } else {
                  EpisodeModel.downloadEpisode(ep._id)
                }
              }
            }, [
              m('.h-full.bg-green-500.absolute', {
                style: 'width: ' + (EpisodeModel.isDownloaded(ep._id) ? '100' : (EpisodeModel.downloading.map(dl => dl.id).includes(ep._id) 
                ? EpisodeModel.downloading.filter(dl => dl.id == ep._id)[0].progress : '0')) + '%;'
              }),
              m('.flex.h-full.justify-center.items-center.relative', EpisodeModel.isDownloaded(ep._id) ?  [
                m(Icon, { icon: 'check', class: 'mr-3' }),
                'Downloaded'
              ] : [
                EpisodeModel.downloading.map(dl => dl.id).includes(ep._id) 
                ? 'Downloading...' 
                : [
                  m(Icon, { icon: 'download', class: 'mr-3' }),
                  'Download'
                ]
              ]) 
            ]) 
          ]),
        ])
      }))
    ]
  }
}

export default QueueList
