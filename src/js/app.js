import '../css/app.css'

import m from 'mithril'
import PouchDB from 'pouchdb'

let db = new PouchDB('http://localhost:5984/kittens')

let App = {
  view() {
    return m('h1', 'hey!!')
  }
}

m.mount(document.body, App)