import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'

import m from 'mithril'
import _ from 'lodash'

import Layout from './Components/Layout'
import PodcastList from './Components/PodcastList'
import PodcastShow from './Components/PodcastShow'
import EpisodeSearch from './Components/EpisodeSearch'
import PodcastCreate from './Components/PodcastCreate'
import QueueList from './Components/QueueList'
import QueueModel from './Models/QueueModel'
import EpisodeModel from './Models/EpisodeModel'
import EpisodeShow from './Components/EpisodeShow'
import Settings from './Components/Settings'
import localforage from 'localforage'
import State from './State'
import Dexie from 'dexie'

if ('serviceWorker' in navigator) {
  let serviceWorkerPath = './service-worker.js'
  navigator.serviceWorker.register(serviceWorkerPath)
}

let dexieDB = new Dexie('podrain')
dexieDB.version(1).stores({
  podcasts: '&_id',
  episodes: '&_id,podcast_id,pubDate',
})
State.dexieDB = dexieDB

localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'Podrain Episodes'
})

EpisodeModel.syncDownloadedEpisodes()

m.route(document.body, '/podcasts', {
  '/settings': {
    onmatch() {
      return Settings
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/podcasts/add': {
    onmatch() {
      return PodcastCreate
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/podcasts/:id/search': {
    onmatch() {
      return EpisodeSearch
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/podcasts/:id': {
    onmatch() {
      return PodcastShow
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/podcasts': {
    onmatch() {
      return PodcastList
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/episodes/:id': {
    onmatch() {
      return EpisodeShow
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  },

  '/queue': {
    onmatch() {
      QueueModel.getQueue()
      return QueueList
    },

    render(vnode) {
      return m(Layout, vnode)
    }
  }
})

if (!localStorage.getItem('proxy_url')) {
  localStorage.setItem('proxy_url', 'https://podrain-proxy.herokuapp.com/')
}