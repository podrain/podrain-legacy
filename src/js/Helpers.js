export default {
  cleanHTMLString(string) {
    return new DOMParser().parseFromString(string, 'text/html').body.textContent
  },

  floatToISO(float = 0) {
    return new Date(float * 1000).toISOString().substr(11, 8)
  }
}