import m from 'mithril'
import State from '../State'
import FileSaver from 'file-saver'

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

    let getPodcasts = State.dexieDB.podcasts.toArray()
    let getEpisodes = State.dexieDB.episodes.toArray()

    Promise.all([getPodcasts, getEpisodes]).then(result => {
      let downloadPayload = {
        podcasts: result[0],
        episodes: result[1]
      }

      let downloadBlob = new Blob([JSON.stringify(downloadPayload)], {
        type: 'text/plain;charset=utf8'
      })

      FileSaver.saveAs(downloadBlob, 'backup.json')
    })
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
          m('div', [
            m('button.bg-purple-600.p-1.text-white.mr-1', {
              onclick() {
                pushToServer()
              }
            }, [
              syncingUp ? m('i.fas.fa-sync-alt.fa-spin') : m('i.fas.fa-arrow-download.mr-1'),
              'Download backup'
            ]),
          ])
        ]),
        m('input.w-full.p-1.mt-1', {
          type: 'file',
          onchange(e) {
            e.target.files[0].text()
              .then(result => {
                let parsedResult = JSON.parse(result)
                console.log('clearing current db')
                return Promise.all([
                  State.dexieDB.podcasts.clear(),
                  State.dexieDB.episodes.clear(),
                ]).then(() => {
                  // console.log('appending file to db')
                  // Promise.all([
                  //   State.dexieDB.podcasts.bulkAdd(parsedResult.podcasts),
                  //   State.dexieDB.episodes.bulkAdd(parsedResult.episodes),
                  // ])
                })
            })
          }
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