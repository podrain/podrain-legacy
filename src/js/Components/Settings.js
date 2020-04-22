import m from 'mithril'
import State from '../State'
import FileSaver from 'file-saver'

function Settings() {

  let proxyURL = localStorage.getItem('proxy_url') || ''
  let syncURL = localStorage.getItem('sync_url') || ''
  let uploadStatus = ''

  function addProxyURL() {
    localStorage.setItem('proxy_url', proxyURL)
  }

  function addSyncURL() {
    localStorage.setItem('sync_url', syncURL)
  }

  function downloadBackup() {
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
        m('.mt-6', [
          m('button.bg-purple-600.p-1.text-white.mr-1.w-full', {
            onclick() {
              downloadBackup()
            }
          }, [
            m('i.fas.fa-download.mr-1'),
            'Download backup'
          ]),
        ]),
        m('h2.text-white.mt-3', 'Restore backup'),
        m('input.text-white.mt-1', {
          type: 'file',
          onchange(e) {
            e.target.files[0].text()
              .then(result => {
                let parsedResult = JSON.parse(result)
                uploadStatus = 'clearing podcasts...'
                return Promise.all([
                  State.dexieDB.podcasts.clear(),
                  State.dexieDB.episodes.clear(),
                ]).then(() => {
                  uploadStatus = 'loading new podcasts...'
                  return Promise.all([
                    State.dexieDB.podcasts.bulkAdd(parsedResult.podcasts),
                    State.dexieDB.episodes.bulkAdd(parsedResult.episodes),
                  ])
                }).then(() => {
                  uploadStatus = 'podcasts loaded!'
                })
            })
          }
        }),
        m('.text-white', uploadStatus)
      ])
    }
  }
}

export default Settings