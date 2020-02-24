import m from 'mithril'
import PodcastListModel from '../../Models/PodcastListModel'
class PodcastList {
  view() {
    return [
      m('.flex.flex-wrap', PodcastListModel.podcasts.map((pc) => {
        return m('.w-1/3.flex-none', [
          m('img', {
            src: pc.meta.imageURL,
            onclick() {
              m.route.set('/podcasts/'+pc.id)
            }
          })
        ])
      }))
    ]
  }
}

export default PodcastList
