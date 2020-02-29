import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'

import m from 'mithril'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
PouchDB.plugin(PouchDBFind)

import Layout from './Components/Layout'
import PodcastList from './Components/PodcastList'
import PodcastListModel from './Models/PodcastListModel'
import PodcastShow from './Components/PodcastShow'
import PodcastShowModel from './Models/PodcastShowModel'
import PodcastCreate from './Components/PodcastCreate'
import QueueList from './Components/QueueList'
import QueueModel from './Models/QueueModel'
import State from './State'

let db = new PouchDB('http://localhost:5984/podrain')
State.db = db

m.route(document.body, '/podcasts', {
  '/podcasts/add': {
    onmatch() {
      return PodcastCreate
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/podcasts/:id': {
    onmatch(args) {
      PodcastShowModel.loading = true

      let getPodcasts = PodcastShowModel.getPodcast(args.id)
      let getEpisodes = PodcastShowModel.getEpisodes(args.id)

      Promise.all([getPodcasts, getEpisodes]).then(() => {
        PodcastShowModel.loading = false
      })

      return PodcastShow
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/podcasts': {
    onmatch() {
      PodcastListModel.getPodcasts()
      
      return PodcastList
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/queue': {
    async onmatch() {
      await QueueModel.getQueue()

      return QueueList
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  }
})