import m from 'mithril'

function Settings() {

  let proxyURL = localStorage.getItem('proxy_url') || ''

  function addProxyURL() {
    localStorage.setItem('proxy_url', proxyURL)
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
        }, 'Save')
      ])
    }
  }
}

export default Settings