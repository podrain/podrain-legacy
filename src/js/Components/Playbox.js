import m from 'mithril'
import EpisodeCurrentlyPlaying from '../Models/EpisodeCurrentlyPlaying'
import State from '../State'

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
    State.db.find({
      selector: {
        type: 'episode',
        currently_playing: true
      }
    }).then(result => {
      return EpisodeCurrentlyPlaying.playEpisode(result.docs[0]._id)
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
            m('i.fas.fa-chevron-down.text-4xl', {
              onclick: () => {
                this.expanded = false
              }
            })
          ])
        ]),
        m('.flex.justify-between', [
          m('i.fas.fa-step-backward.text-4xl', {
            onclick() {
              EpisodeCurrentlyPlaying.playPrev()
            }
          }),
          m('i.fas.fa-undo.text-4xl', {
            onclick() {
              EpisodeCurrentlyPlaying.jumpBack()
            }
          }),
          m('i.fas.text-4xl.text-teal-500', {
            class: EpisodeCurrentlyPlaying.audio && EpisodeCurrentlyPlaying.audio.paused ? 'fa-play' : 'fa-pause',
            onclick() {
              EpisodeCurrentlyPlaying.playOrPause()
            }
          }),
          m('i.fas.fa-redo.text-4xl', {
            onclick() {
              EpisodeCurrentlyPlaying.jumpAhead()
            }
          }),
          m('i.fas.fa-step-forward.text-4xl', {
            onclick() {
              EpisodeCurrentlyPlaying.playNext()
            }
          }),
        ]),
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
        m('i.fas.fa-chevron-up.text-4xl')
      ])
    ]
  }
}

export default PlayBox
