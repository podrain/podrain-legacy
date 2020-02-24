import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'

import m from 'mithril'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
PouchDB.plugin(PouchDBFind)

import Layout from './Components/Layout/Layout'
import PodcastList from './Components/Podcast/PodcastList'
import PodcastListModel from './Models/PodcastListModel'
import PodcastShow from './Components/Podcast/PodcastShow'
import PodcastShowModel from './Models/PodcastShowModel'
import State from './State'

let db = new PouchDB('http://localhost:5984/podrain')
State.db = db

m.route(document.body, '/podcasts', {
  '/podcasts/:id': {
    onmatch(args) {
      PodcastShowModel.loading = true
      PodcastShowModel.getPodcast(args.id).then(() => {
        return PodcastShowModel.getEpisodes(args.id)
      }).then(() => {
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
  }
})