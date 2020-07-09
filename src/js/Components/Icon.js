import m from 'mithril'
import icons from '../../../node_modules/@fortawesome/fontawesome-free/svgs/**/*.svg'

function Icon() {
  let iconString = ''

  return {
    oninit(vnode) {
      m.request(icons.solid[vnode.attrs.icon], {
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
    },

    view(vnode) {
      return m('.inline-block', vnode.attrs, m.trust(iconString))
    }
  }
}

export default Icon