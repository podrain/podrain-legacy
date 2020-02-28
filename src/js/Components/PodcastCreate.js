import m from 'mithril'
import PodcastCreateModel from '../Models/PodcastCreateModel'

function PodcastCreate() {
  return {
    view() {
      return [
        m('.p-3', [
          m('h1.text-white.text-2xl', 'Add podcast'),
          m('input.w-full.mt-3.p-1', {
            type: 'text',
            placeholder: 'Podcast title to search...',
            oninput(e) {
              PodcastCreateModel.setSearch(e.target.value)
            }
          }),
          // m('button.bg-green-500.text-white', {
          //   onclick() {
          //     PodcastCreateModel.searchPodcasts()
          //   }
          // }, 'Submit'),
          PodcastCreateModel.searching 
          ? m('h2.mt-3.text-white', 'Searching...')
          : m('ul.mt-3', [
            PodcastCreateModel.searchResults.map((sr, index) => {
              return m('li.text-white', {
                class: index > 0 ? 'mt-3' : '',
                onclick() {
                  PodcastCreateModel.url = sr.feedUrl
                  PodcastCreateModel.addPodcast().then(() => {
                    m.route.set('/podcasts')
                  })
                }
              }, [
                m('.p-3.bg-gray-700.flex', [
                  m('img.w-1/4', {
                    src: sr.artworkUrl100
                  }),
                  m('.w-3/4.ml-3', sr.collectionName)
                ])
              ])
            })
          ])
        ])
      ]
    }
  }
}

export default PodcastCreate