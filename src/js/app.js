import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'

import m from 'mithril'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

import Layout from './Components/Layout/Layout'
import PodcastList from './Components/Podcast/PodcastList'
import PodcastListModel from './Models/PodcastListModel'
import State from './State'

PouchDB.plugin(PouchDBFind)

let db = new PouchDB('http://localhost:5984/podrain')
State.db = db

m.route(document.body, '/podcasts', {
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