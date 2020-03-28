import m from 'mithril'
import EpisodeSearchModel from '../Models/EpisodeSearchModel'

function EpisodeSearch() {
  return {
    view() {
      return [
        m('h1.text-white', 'Search '+EpisodeSearchModel.podcast.meta.title),
        m('input.p-3.w-full', {
          oninput(e) {
            EpisodeSearchModel.searchEpisodes(e.target.value)
          }
        }),
        m('ul', EpisodeSearchModel.searchResults.map(sr => {
          return m('li.text-white', sr.title)
        }))
      ]
    }
  }
}

export default EpisodeSearch