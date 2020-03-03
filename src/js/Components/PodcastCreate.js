import m from 'mithril'
import PodcastCreateModel from '../Models/PodcastCreateModel'

function PodcastCreate() {
  let selectedTab = 'search'

  return {
    view() {
      return [
        m('.p-3', [
          m('h1.text-white.text-2xl', 'Add podcast'),
          m('.flex.mt-3', [
            m('button.flex-1.p-3', {
              class: selectedTab == 'search' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white',
              onclick() {
                selectedTab = 'search'
              }
            }, [
              m('i.fas.fa-search.mr-3'),
              'Search'
            ]),
            m('button.flex-1.p-3', {
              class: selectedTab == 'rss' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white',
              onclick() {
                selectedTab = 'rss'
              }
            }, [
              m('i.fas.fa-rss.mr-3'),
              'RSS Feed'
            ]),
          ]),
          selectedTab == 'search' ? [
            m('input.w-full.mt-3.p-1', {
              type: 'text',
              placeholder: 'Podcast title to search...',
              oninput(e) {
                PodcastCreateModel.setSearch(e.target.value)
              }
            }),
            PodcastCreateModel.searching 
            ? m('h2.mt-3.text-white', 'Searching...')
            : m('ul.mt-3', [
              PodcastCreateModel.searchResults.map((sr, index) => {
                return m('li.flex.text-white', {
                  class: index > 0 ? 'mt-3' : '',
                }, [
                  m('.p-3.bg-gray-700.w-full.flex', [
                    m('img.w-1/4', {
                      src: sr.artworkUrl100
                    }),
                    m('.w-3/4.ml-3', [
                      m('h3', sr.collectionName),
                      PodcastCreateModel.feedUrl == sr.feedUrl
                      ? PodcastCreateModel.episodesAdded
                        + ' / ' 
                        + PodcastCreateModel.episodesTotal
                      : 'coolbeans'
                    ])
                  ]),
                  PodcastCreateModel.feedUrl 
                    && PodcastCreateModel.feedUrl != sr.feedUrl 
                    ? null 
                    : m('.w-12.flex.justify-center.items-center.bg-green-500', {
                    onclick() {
                      PodcastCreateModel.addPodcast(sr.feedUrl).then(() => {
                        m.route.set('/podcasts')
                      })
                    }
                  }, [
                    PodcastCreateModel.feedUrl == sr.feedUrl
                    ? m('i.fas.fa-spinner.fa-spin', {
                      disabled: true
                    })
                    : m('i.fas.fa-plus')
                  ])
                ])
              })
            ])
          ] : null,
          selectedTab == 'rss' ? [
            m('input.w-full.mt-3.p-1', {
              type: 'text',
              placeholder: 'URL to podcast feed...',
              oninput(e) {
                PodcastCreateModel.feedUrl = e.target.value
              }
            }),
            m('button.w-full.bg-green-500.mt-3.p-2.text-white', {
              onclick() {
                PodcastCreateModel.addPodcast().then(() => {
                  m.route.set('/podcasts')
                })
              }
            }, 'Submit')
          ] : null,
        ])
      ]
    }
  }
}

export default PodcastCreate