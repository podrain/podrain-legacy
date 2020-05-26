import m from 'mithril'
import EpisodeSearchModel from '../Models/EpisodeSearchModel'
import Episode from './Episode'

function EpisodeSearch() {
  return {
    view() {
      return EpisodeSearchModel.loading 
      ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
      : m('.p-3', [
          m('h1.text-white', [
            'Search episodes in ',
            m('span.italic', EpisodeSearchModel.podcast.meta.title)
          ]),
          m('input.p-1.w-full.mt-1', {
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
        ])
    }
  }
}

export default EpisodeSearch