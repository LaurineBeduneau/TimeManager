import { defineStore } from 'pinia'

type LayoutState = {
  navOpen: boolean
}

const useLayoutStore = defineStore({
  id: 'layout',
  state: () => {
    return {
      navOpen: false
    } as LayoutState
  },

  actions: {
    toggleNav(state?: boolean) {
      if (state === undefined) {
        this.navOpen = !this.navOpen
      } else {
        this.navOpen = state
      }
    },
    $reset() {
      this.navOpen = false
    }
  }
})

export { useLayoutStore }
