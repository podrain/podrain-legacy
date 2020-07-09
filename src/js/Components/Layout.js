import m from 'mithril'
import Playbox from './Playbox'
import Icon from './Icon'

class Layout {
  view(vnode) {
    return [
      m('.flex.flex-col.h-screen', [
        m('.flex.items-center.justify-between.h-16.bg-teal-800.px-4.text-white', [
          m(Icon, { 
            icon: 'home',
            class: 'text-4xl',
            onclick: () => {
              m.route.set('/')
            }
          }),
          m(Icon, { 
            icon: 'list-ol',
            class: 'text-4xl',
            onclick: () => {
              m.route.set('/queue')
            }
          }),
          m(Icon, { 
            icon: 'plus',
            class: 'text-4xl',
            onclick: () => {
              m.route.set('/podcasts/add')
            }
          }),
          m(Icon, { 
            icon: 'cog',
            class: 'text-4xl',
            onclick: () => {
              m.route.set('/settings')
            }
          }),
        ]),
        m('.flex-1.overflow-y-scroll.bg-gray-800', vnode.children),
        m(Playbox)
      ])
    ]
  }
}

export default Layout
