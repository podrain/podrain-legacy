import m from 'mithril'
import Playbox from './Playbox'

class Layout {
  view(vnode) {
    return (
      <div class="flex flex-col h-screen">
        <div class="flex items-center justify-between h-16 bg-teal-800 px-4 text-white">
          <i class="fas fa-home text-4xl" onclick={() => { m.route.set('/') }} />
          <i class="fas fa-list-ol text-4xl" onclick={() => { m.route.set('/queue') }} />
          <i class="fas fa-plus text-4xl" onclick={() => { m.route.set('/podcasts/add') }} />
          <i class="fas fa-cog text-4xl" onclick={() => { m.route.set('/settings') }} />
        </div>
        <div class="flex-1 overflow-y-scroll bg-gray-800">
          {vnode.children}
        </div>
        <Playbox />
      </div>
    )
  }
}

export default Layout
