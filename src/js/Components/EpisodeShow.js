import m from 'mithril'
import EpisodeShowModel from '../Models/EpisodeShowModel'

class EpisodeShow {
  view() {
    return EpisodeShowModel.loading
    ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
    : [
      m('h1.text-white', EpisodeShowModel.episode.title)
    ]
  }
}

export default EpisodeShow