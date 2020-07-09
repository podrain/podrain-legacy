import m from 'mithril'
import State from '../State'
import FileSaver from 'file-saver'
import Icon from './Icon'

function Settings() {

  let proxyURL = localStorage.getItem('proxy_url') || ''
  let restoreStatus = ''
  let restoring = false
  let restoreFile = null

  function addProxyURL() {
    localStorage.setItem('proxy_url', proxyURL)
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

  function restoreBackup() {
    restoring = true
    restoreStatus = 'Starting restore...'
    restoreFile.text().then(result => {
      let parsedResult = JSON.parse(result)
      restoreStatus = 'Clearing podcasts...'
      return Promise.all([
        State.dexieDB.podcasts.clear(),
        State.dexieDB.episodes.clear(),
      ]).then(() => {
        restoreStatus = 'Loading new podcasts...'
        return Promise.all([
          State.dexieDB.podcasts.bulkAdd(parsedResult.podcasts),
          State.dexieDB.episodes.bulkAdd(parsedResult.episodes),
        ])
      }).then(() => {
        restoreStatus = 'podcasts loaded!'
        restoring = false
      })
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
        m('button.w-full.bg-green-500.h-8.text-white', {
          onclick() {
            addProxyURL()
            m.route.set('/')
          }
        }, [
          m(Icon, { icon: 'save', class: 'mr-3'}),
          'Save'
        ]),
        m('.mt-6', [
          m('button.bg-purple-600.p-1.text-white.mr-1.w-full', {
            onclick() {
              downloadBackup()
            }
          }, [
            m(Icon, { icon: 'download', class: 'mr-3' }),
            'Download backup'
          ]),
        ]),
        m('h2.text-white.mt-3', 'Restore backup'),
        m('input.text-white.mt-1', {
          type: 'file',
          onchange(e) {
            restoreFile = e.target.files[0]
          }
        }),
        restoreFile ? m('button.bg-orange-600.p-1.text-white.mr-1.w-full.mt-3', {
          disabled: restoring ? true : false,
          onclick() {
            restoreBackup()
          }
        }, [
          restoring ? m(Icon, { icon: 'spinner', class: 'mr-3' }) : m(Icon, { icon: 'upload', class: 'mr-3'}),
          restoring ? restoreStatus : 'Restore backup'
        ]) : null,
      ])
    }
  }
}

export default Settings