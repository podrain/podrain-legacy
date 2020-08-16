import m from 'mithril'

function Loading() {
  return {
    view() {
      return <div class="anim-fade-in flex text-white text-5xl h-full justify-center items-center"><i class="fas fa-spinner fa-spin"></i></div>
    }
  }
}

export default Loading