import m from 'mithril'
import State from '../State'
import feedParser from 'better-podcast-parser'
import uuidv4 from 'uuid/v4'
import _ from 'lodash'

function PodcastCreate() {
  let selectedTab = 'search'

  let feedUrl = ''
  let manualRssUrl = ''
  let search = ''
  let searchResults = []
  let searching = false
  let episodesAdded = 0
  let episodesTotal = 0

  function setSearch(value) {
    search = value
    searching = true
    searchPodcastsDelay()
  }

  function addPodcast(podcastUrl) {
    feedUrl = podcastUrl
    feedUrl = feedUrl.replace(/(?!:\/\/):/g, '%3A')
    return m.request(localStorage.getItem('proxy_url') + feedUrl, {
      extract: function(xhr) {
        return xhr
      },
      headers: {
        'accept': 'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4'
      }
    }).then(response => {
      let feedData = response.responseText
      return feedParser.parseFeed(feedData, {
        proxyURL: localStorage.getItem('proxy_url'),
        getAllPages: true
      })
    }).then(podcast => {
      let podcastOnly = _.clone(podcast)

      delete podcastOnly.episodes

      let podcastID = uuidv4()
      episodesTotal = podcast.episodes.length

      let addPodcast = State.dexieDB.podcasts.add(_.merge(podcastOnly, {
        '_id': podcastID,
        'feed_url': feedUrl
      }))

      let addPodcastEpisodes = []
      for (let ep of podcast.episodes) {
        addPodcastEpisodes.push(State.dexieDB.episodes.add(_.merge(ep, {
          '_id': uuidv4(),
          'podcast_id': podcastID,
          'queue': 0,
          'playhead': 0,
          'currently_playing': false,
          'played': false
        })).then(() => {
          episodesAdded += 1
          m.redraw()
        }))
      }

      return Promise.all([addPodcast, ...addPodcastEpisodes])
    }).then(() => {
      feedUrl = ''
      episodesAdded = 0
      episodesTotal = 0
    })
  }

  let searchPodcastsDelay = _.debounce(() => {
    searchPodcasts()
  }, 250)

  function searchPodcasts() {
    return m.request('https://itunes.apple.com/search', {
      params: {
        term: search,
        media: 'podcast',
        entity: 'podcast'
      }
    }).then(result => {
      searchResults = result.results
      searching = false
    })
  }

  return {
    view() {
      return (
        <div class="p-3">
          <h1 class="text-white text-2xl">Add Podcast</h1>
          <div class="flex mt-3">
            <button 
              class={`flex-1 p-3 ${selectedTab == 'search' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}
              onclick={() => {
                selectedTab = 'search'
              }}
            >
              <i class="fas fa-search mr-3"></i>
              Search
            </button>
            <button
              class={`flex-1 p-3 ${selectedTab == 'rss' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}
              onclick={() => {
                selectedTab = 'rss'
              }}
            >
              <i class="fas fa-rss mr-3"></i>
              RSS Feed
            </button>
          </div>

          {
            selectedTab == 'search' &&
                <input 
                  type="text"
                  class="w-full mt-3 p-1"
                  placeholder="Podcast title to search..."
                  oninput={(e) => {
                    setSearch(e.target.value)
                  }}
                />
          }

          {
            selectedTab == 'search' &&
              (searching ? 
                <h2 class="mt-3 text-white">Searching...</h2>
              :
                <ul class="mt-3">
                  {searchResults.map((sr, index) => 
                    <li class={`text-white flex ${index > 0 && 'mt-3'}`}>
                      <div class="p-3 bg-gray-700 w-full flex">
                        <img class="w-1/4" src={sr.artworkUrl100} />
                        <div class="w-3/4 ml-3">
                          <h3>{sr.collectionName}</h3>
                          { feedUrl == sr.feedUrl ?
                              <div class="italic text-gray-200">
                                Adding episodes:<br />
                                {episodesAdded + '/' + episodesTotal}
                              </div>
                            :
                              sr.trackCount + ' episodes'
                          }
                        </div>
                      </div>

                      {
                        feedUrl && feedUrl != sr.feedUrl ?
                          null
                        :
                          <div 
                            class="w-12 flex justify-center items-center bg-green-500"
                            onclick={() => {
                              addPodcast(sr.feedUrl).then(() => {
                                m.route.set('/podcasts')
                              })
                            }}
                          >
                            {
                              feedUrl == sr.feedUrl ?
                                <i 
                                  class="fas fa-spinner fa-spin"
                                  disabled={true}
                                ></i>
                              :
                                <i class="fas fa-plus"></i>
                            }
                          </div>
                        }
                    </li>
                  )}
                </ul>
              )
          }

          {
            selectedTab == 'rss' &&
              <input 
                type="text"
                class="w-full mt-3 p-1" 
                placeholder="URL to podcast feed..."
                oninput={(e) => {
                  manualRssUrl = e.target.value
                }}
              />
          }

          {
            selectedTab == 'rss' &&
              <button 
                class="w-full bg-green-500 mt-3 p-2 text-white"
                onclick={() => {
                  addPodcast(manualRssUrl).then(() => {
                    m.route.set('/podcasts')
                  })
                }}
              >Submit</button>
          }
        </div>
      )
    }
  }
}

export default PodcastCreate