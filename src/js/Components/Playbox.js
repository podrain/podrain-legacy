import m from 'mithril'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import State from '../State'
import Helpers from '../Helpers'
import Icon from './Icon'

class PlayBox {
  constructor() {
    this.expanded = true
  }

  oninit() {
    EpisodeCurrentlyPlaying.audio = new Audio

    setInterval(() => {
      EpisodeCurrentlyPlaying.updatePlayhead()
    }, 1000)

    setInterval(() => {
      EpisodeCurrentlyPlaying.updatePlayhead(true)
    }, 5000)

    EpisodeCurrentlyPlaying.audio.addEventListener('ended', async () => {
      await EpisodeCurrentlyPlaying.playNext(true, true)
    })

    // Get currently playing episode if available

    State.dexieDB.episodes
      .filter(ep => ep.currently_playing == true)
      .toArray().then(result => {
        return EpisodeCurrentlyPlaying.playEpisode(result[0]._id)
      })
  }

  view() {
    return this.expanded ? [
      m('.h-48.bg-gray-200.p-3.flex.flex-col.justify-between', [
        m('.flex.justify-between', [
          m('.flex.flex-col.w-4/5', [
            m('.w-full.text-grey-800.text-sm',
              EpisodeCurrentlyPlaying.episode
              ? EpisodeCurrentlyPlaying.episode.podcast.meta.title
              : ''),
            m('.w-full.whitespace-no-wrap.overflow-x-hidden', [
              m('marquee', {
                'scrollamount': 4,
              }, EpisodeCurrentlyPlaying.episode
              ? EpisodeCurrentlyPlaying.episode.title
              : '')
            ]),
          ]),
          m('.flex.justify-end.items-start.w-1/5', [
            m(Icon, {
              icon: 'chevron-down',
              class: 'text-4xl',
              onclick: () => {
                this.expanded = false
              }
            })

          ])
        ]),
        m('.flex.justify-between', [
          m(Icon, {
            icon: 'step-backward',
            class: 'text-4xl',
            onclick: () => {
              EpisodeCurrentlyPlaying.playPrev()
            }
          }),
          m(Icon, {
            icon: 'undo',
            class: 'text-4xl',
            onclick: () => {
              EpisodeCurrentlyPlaying.jumpBack()
            }
          }),
          m(Icon, {
            icon: EpisodeCurrentlyPlaying.audio && EpisodeCurrentlyPlaying.audio.paused ? 'play' : 'pause',
            class: 'text-4xl text-teal-500',
            onclick: () => {
              EpisodeCurrentlyPlaying.playOrPause()
            }
          }),
          m(Icon, {
            icon: 'redo',
            class: 'text-4xl',
            onclick: () => {
              EpisodeCurrentlyPlaying.jumpAhead()
            }
          }),
          m(Icon, {
            icon: 'step-forward',
            class: 'text-4xl',
            onclick: () => {
              EpisodeCurrentlyPlaying.playNext()
            }
          }),
        ]),
        m('div', Helpers.floatToISO(EpisodeCurrentlyPlaying.playhead) 
          + ' / ' 
          + (EpisodeCurrentlyPlaying.episode ? Helpers.floatToISO(EpisodeCurrentlyPlaying.episode.duration) : '00:00:00'),
        ),
          m('.flex.items-center.justify-between', [
          m('.relative.w-full', [
            m('input#play-slider.w-full.appearance-none.bg-gray-200', {
              type: 'range',
              min: 0,
              max: EpisodeCurrentlyPlaying.episode
              ? EpisodeCurrentlyPlaying.episode.duration
              : 0,
              value: EpisodeCurrentlyPlaying.episode
              ? EpisodeCurrentlyPlaying.playhead
              : 0,
              onchange(e) {
                EpisodeCurrentlyPlaying.setPlayhead(e.target.value)
              }
            })
          ])
        ])
      ])
    ] : [
      m('.h-12.bg-gray-200.flex.items-center.justify-center', {
        onclick: () => {
          this.expanded = true
        }
      }, [
        m(Icon, {
          icon: 'chevron-up',
          class: 'text-4xl'
        })
      ])
    ]
  }
}

export default PlayBox
