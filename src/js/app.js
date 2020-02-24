import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'

import m from 'mithril'
import PouchDB from 'pouchdb'

import Layout from './Components/Layout/Layout'
import PodcastList from './Components/Podcast/PodcastList'

let db = new PouchDB('http://localhost:5984/podrain')

m.route(document.body, '/podcasts', {
  '/podcasts': {
    onmatch() {
      return PodcastList
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  }
})