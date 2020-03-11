export default {
  cleanHTMLString(string) {
    return new DOMParser().parseFromString(string, 'text/html').body.textContent
  }
}