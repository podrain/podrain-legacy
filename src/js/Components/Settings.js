import m from 'mithril'
import State from '../State'

function Settings() {

  let proxyURL = localStorage.getItem('proxy_url') || ''
  let syncURL = localStorage.getItem('sync_url') || ''
  let syncingUp = false
  let syncingDown = false

  function addProxyURL() {
    localStorage.setItem('proxy_url', proxyURL)
  }

  function addSyncURL() {
    localStorage.setItem('sync_url', syncURL)
  }

  function pushToServer() {
    // syncingUp = true
    // State.db.replicate.to(State.remoteDB).on('complete', function() {
    //   console.log('data pushed to server')
    //   syncingUp = false
    // }).on('error', function() {
    //   console.log('something went wrong with push')
    //   syncingUp = false
    // })
    console.log('not doin nothin')
  }

  function pullFromServer() {
    // syncingDown = true
    // State.db.replicate.from(State.remoteDB).on('complete', function() {
    //   console.log('data pulled from server')
    //   syncingDown = false
    // }).on('error', function() {
    //   console.log('something went wrong with pull')
    //   syncingDown = false
    // })

    console.log('not doin nothin')
  }

  return {
    view() {
      return m('.p-3', [
        m('h1.text-white.text-xl.text-center', 'Settings'),
        m('span.text-white', 'Proxy URL'),
        m('input.w-full.p-1.mt-1', {
          oninput(e) {
            proxyURL = e.target.value
          },
          value: proxyURL
        }),
        m('button.w-full.bg-green-500.h-8.text-white.mt-3', {
          onclick() {
            addProxyURL()
            m.route.set('/')
          }
        }, 'Save'),
        m('.flex.mt-6.justify-between', [
          m('.text-white.flex.items-end', 'Sync URL'),
          m('div', [
            m('button.bg-purple-600.p-1.text-white.mr-1', {
              onclick() {
                pushToServer()
              }
            }, [
              syncingUp ? m('i.fas.fa-sync-alt.fa-spin') : m('i.fas.fa-arrow-up.mr-1'),
              'Push up'
            ]),
            m('button.bg-purple-400.p-1.text-white', {
              onclick() {
                pullFromServer()
              }
            }, [
              syncingDown ? m('i.fas.fa-sync-alt.fa-spin') : m('i.fas.fa-arrow-down.mr-1'),
              'Pull down'
            ]),
          ])
        ]),
        m('input.w-full.p-1.mt-1', {
          oninput(e) {
            syncURL = e.target.value
          },
          value: syncURL
        }),
        m('button.w-full.bg-green-500.h-8.text-white.mt-3', {
          onclick() {
            addSyncURL()
            m.route.set('/')
          }
        }, 'Save')
      ])
    }
  }
}

export default Settings