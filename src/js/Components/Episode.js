import m from 'mithril'
import Helpers from '../Helpers'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import QueueModel from '../Models/QueueModel'
import EpisodeModel from '../Models/EpisodeModel'
import _ from 'lodash'
import Icon from './Icon'

function Episode() {
  return {
    view(vnode) {
      return [
        m('li.flex.flex-col', {
          key: vnode.attrs.episode._id,
          class: 'mt-3'
        }, [
          m('.flex-1.p-3.relative', {
            class: vnode.attrs.episode.currently_playing ? 'bg-orange-500' : 'bg-gray-700',
            onclick() {
              m.route.set('/episodes/'+vnode.attrs.episode._id)
            }
          }, [
            vnode.attrs.episode.played ? m('.w-8.h-8.bg-yellow-500.absolute.bottom-0.left-0.flex.justify-center.items-center', [
              m(Icon, {
                icon: 'check',
                class: 'text-black'
              })
            ]) : null,
            m('.leading-tight.text-xs.font-bold.truncate', vnode.attrs.episode.title),
            m('.flex.mt-3', [
              m('.w-1/5', m('img', { src: vnode.attrs.episode.imageURL || vnode.attrs.alternateImageURL })),
              m('.w-4/5.text-xs.font-light.ml-3', vnode.attrs.episode.description ? (
                Helpers.cleanHTMLString(vnode.attrs.episode.description).length > 125 
                ? Helpers.cleanHTMLString(vnode.attrs.episode.description).substr(0, 125) + '...' 
                : Helpers.cleanHTMLString(vnode.attrs.episode.description)) 
              : 'No description provided')
            ])
          ]),
          m('.flex.h-8.w-full', [
            m('button.w-1/4.flex.justify-center.items-center.bg-blue-500', {
              onclick() {
                EpisodeCurrentlyPlaying.playEpisode(vnode.attrs.episode._id, true)
              }
            }, [
              m(Icon, {
                icon: !EpisodeCurrentlyPlaying.audio.paused && EpisodeCurrentlyPlaying.episode._id == vnode.attrs.episode._id ? 'pause' : 'play'
              })
            ]),
            m('button.w-3/4.flex.justify-center.items-center', {
              class: vnode.attrs.episode.queue ? 'bg-red-500' : 'bg-green-500',
              onclick() {
                let method = null
  
                if (vnode.attrs.episode.queue) {
                  method = QueueModel.removeFromQueue(vnode.attrs.episode._id)
                } else {
                  method = QueueModel.addToQueue(vnode.attrs.episode._id)
                }
  
                method.then(() => {
                  return EpisodeModel.getEpisode(vnode.attrs.episode._id)
                }).then(updatedEpisode => {
                  let episodeIndex = _.findIndex(vnode.attrs.partOf, (fep) => {
                    return fep._id == vnode.attrs.episode._id
                  })
                  vnode.attrs.partOf[episodeIndex] = updatedEpisode
                })
              },
              disabled: QueueModel.queueChanging
            }, [
              QueueModel.queueChanging ? m(Icon, { icon: 'spinner' }) : (vnode.attrs.episode.queue ? [m(Icon, { icon: 'minus', class: 'mr-3' }),'Remove from queue'] : [m(Icon, {icon: 'plus', class: 'mr-3' }),'Add to queue'])
            ])
          ]),
        ])
      ]
    }
  }
}

export default Episode