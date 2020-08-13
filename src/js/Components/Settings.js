import m from 'mithril'
import State from '../State'
import FileSaver from 'file-saver'

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
      return (
        <div class="p-3">
          <h1 class="text-white text-xl text-center">Settings</h1>
          <span class="text-white">Proxy URL</span>
          <input
            class="w-full p-1 mt-1"
            oninput={(e) => {
              proxyURL = e.target.value
            }}
            value={proxyURL}
          />
          <button 
            class="w-full bg-green-500 h-8 text-white"
            onclick={() => {
              addProxyURL()
              m.route.set('/')
            }}
          >
            <i class="fas fa-save mr-3"></i>
            Save
          </button>

          <div class="mt-6">
            <button 
              class="bg-purple-600 p-1 text-white mr-1 w-full"
              onclick={() => {
                downloadBackup()
              }}
            >
              <i class="fas fa-download mr-3"></i>
              Download Backup
            </button>
          </div>

          <h2 class="text-white mt-3">Restore backup</h2>
          <input 
            class="text-white mt-1"
            type="file"
            onchange={(e) => {
              restoreFile = e.target.files[0]
            }}
          />

          {
            restoreFile &&
              <button 
                class="bg-orange-600 p-1 text-white mr-1 w-full mt-3"
                disabled={restoring ? true : false}
                onclick={() => {
                  restoreBackup()
                }}
              >
                {
                  restoring ?
                    <i class="fas fa-spinner fa-spin mr-3"></i>
                  :
                    <i class="fas fa-upload mr-3"></i>
                }

                {
                  restoring ?
                    restoreStatus
                  : 
                    'Restore backup'
                }
              </button>
          }
        </div>
      )
    }
  }
}

export default Settings