import m from 'mithril'
import EpisodeSearchModel from '../Models/EpisodeSearchModel'
import Episode from './Episode'

function EpisodeSearch() {
  return {
    view() {
      return EpisodeSearchModel.loading 
      ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
      : [
        m('h1.text-white', 'Search '+EpisodeSearchModel.podcast.meta.title),
        m('input.p-3.w-full', {
          oninput(e) {
            EpisodeSearchModel.searchEpisodes(e.target.value)
          }
        }),
        m('ul.text-white.m-3', EpisodeSearchModel.searchResults.map((ep) => {
          return m(Episode, {
            episode: ep,
            partOf: EpisodeSearchModel.searchResults
          })
        })),
      ]
    }
  }
}

export default EpisodeSearch