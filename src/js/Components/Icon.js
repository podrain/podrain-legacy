import m from 'mithril'
import icons from '../../../node_modules/@fortawesome/fontawesome-free/svgs/**/*.svg'

function Icon() {
  let currentIcon = null
  let iconString = ''

  function getIcon(icon) {
    m.request(icons.solid[icon], {
      extract: function(xhr) { return xhr }
    }).then(xhr => {
      let oParser = new DOMParser()
      let svgDom = oParser.parseFromString(xhr.responseText, 'image/svg+xml')
      svgDom.getElementsByTagName('svg')[0].setAttribute('fill', 'currentColor')
      svgDom.getElementsByTagName('svg')[0].setAttribute('height', '1em')
      svgDom.getElementsByTagName('svg')[0].setAttribute('width', '1em')
      
      let serializer = new XMLSerializer()
      iconString = serializer.serializeToString(svgDom)
    })
  }

  return {
    oninit(vnode) {
      currentIcon = vnode.attrs.icon
      getIcon(currentIcon)
    },

    onupdate(vnode) {
      if (currentIcon != vnode.attrs.icon) {
        currentIcon = vnode.attrs.icon
        getIcon(vnode.attrs.icon)
      }
    },

    view(vnode) {
      return m('.inline-block', vnode.attrs, m.trust(iconString))
    }
  }
}

export default Icon