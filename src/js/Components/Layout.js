import m from 'mithril'
import PodcastCreateModel from '../Models/PodcastCreateModel'

class Layout {
  constructor() {
    this.addPodcastDialog = false
  }

  view(vnode) {
    return [
      m('.flex.flex-col.h-screen', [
        m('.flex.items-center.justify-between.h-16.bg-teal-800.px-4.text-white', [
          m('i.fas.fa-home.text-4xl', {
            onclick() {
              m.route.set('/')
            }
          }),
          m('i.fas.fa-list-ol.text-4xl', {
            onclick() {
              m.route.set('/queue')
            }
          }),
          m('i.fas.fa-plus.text-4xl', {
            onclick: () => {
              this.addPodcastDialog = !this.addPodcastDialog
            }
          }),
        ]),
        this.addPodcastDialog ? m('.flex.flex-col', [
          m('input.h-12', {
            type: 'text',
            oninput(e) {
              PodcastCreateModel.url = e.target.value
            },
            value: PodcastCreateModel.url
          }, [
  
          ]),
          m('button.bg-green-500.text-white', {
            onclick: () => {
              PodcastCreateModel.addPodcast()
              this.addPodcastDialog = false
            }
          }, 'Add podcast')
        ]) : null,
        m('.flex-1.overflow-y-auto.bg-gray-800', vnode.children)
      ])
    ]
  }
}

export default Layout
