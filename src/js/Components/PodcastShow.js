import m from 'mithril'
import PodcastShowModel from '../Models/PodcastShowModel'
import Episode from './Episode'

class PodcastShow {
  view() {
    return PodcastShowModel.loading
    ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
    : m('.flex.flex-col', [
      m('.flex', [
        m('.w-1/3.m-3', [
          m('img', {
            src: PodcastShowModel.podcast.meta.imageURL
          })
        ]),
        m('.w-2/3.flex.flex-col.justify-center.text-lg.py-3.pr-3', [
          m('h1.text-white.font-bold.leading.snug', PodcastShowModel.podcast.meta.title),
          m('.mt-3.flex-col', [
            m('.flex', [
              m('button.text-white.bg-indigo-500.p-2.text-sm.flex-1', {
                onclick() {
                  PodcastShowModel.refreshEpisodes(PodcastShowModel.podcast._id).then(() => {
                    PodcastShowModel.getEpisodes(PodcastShowModel.podcast._id)
                  })
                }
              }, [
                m('i.fas.fa-sync-alt.mr-3', {
                  class: PodcastShowModel.refreshing ? 'fa-pulse' : ''
                }),
                'Refresh'
              ]),
              m('button.text-white.bg-red-500.p2.text-sm.flex-1', {
                onclick() {
                  PodcastShowModel.deletePodcast(PodcastShowModel.podcast._id)
                }
              }, [
                m('i.fas.mr-3', {
                  class: PodcastShowModel.deleting ? 'fa-spinner fa-spin' : 'fa-times'
                }),
                'Delete'
              ])
            ]),
            m('button.bg-yellow-500.p-2.text-sm.w-full', {
              onclick() {
                m.route.set('/podcasts/'+PodcastShowModel.podcast._id+'/search')
              }
            }, [
              m('i.fas.fa-search.mr-3'),
              'Search episodes'
            ])
          ])
        ])
      ]),
      m('ul.text-white.mx-3.mb-3', PodcastShowModel.episodes.map((ep, index) => {
        return m(Episode, {
          episode: ep,
          alternateImageURL: PodcastShowModel.podcast.meta.imageURL,
          partOf: PodcastShowModel.episodes
        })
      })),
      m('button.bg-purple-500.text-white.mx-3.mb-3.p-3', {
        onclick() {
          PodcastShowModel.getMoreEpisodes(PodcastShowModel.podcast._id, 10)
        }
      }, 'Load more')
    ])
  }
}

export default PodcastShow
