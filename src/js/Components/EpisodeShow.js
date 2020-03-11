import m from 'mithril'
import EpisodeShowModel from '../Models/EpisodeShowModel'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'

class EpisodeShow {
  view() {
    return EpisodeShowModel.loading
    ? m('.flex.text-white.text-5xl.h-full.justify-center.items-center', 'Loading...')
    : [
      m('.p-3', [
        m('h1.text-white.text.text-xl', EpisodeShowModel.episode.title),
        m('.flex.mt-3', [
          m('button.bg-green-500.text-white.w-full.p-3', {
            onclick() {
              EpisodeCurrentlyPlaying.playEpisode(EpisodeShowModel.episode._id, true)
            }
          }, [
            m('i.fas.fa-play.mr-3'),
            'Play'
          ])
        ]),
        m('.markdown.text-gray-300.leading-snug.mt-3.text-sm', m.trust(EpisodeShowModel.episode.description))
      ])
    ]
  }
}

export default EpisodeShow