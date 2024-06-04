import { defineStore } from 'pinia'
import api from '@/scripts/api'

type ClockState = {
  started: boolean
  startTime: number
}

const useClockStore = defineStore({
  id: 'clock',
  state: () => {
    return {
      started: false,
      startTime: 0
    } as ClockState
  },

  actions: {
    async toggleClock() {
      this.started = !this.started
      this.startTime = Date.now()

      await api.clockIn()
    },
    async getClock() {
      const response = await api.getClock()
      if (response.status === 200) {
        const responseData = response.data

        this.started = responseData.data.status
        if (this.started) {
          this.startTime = new Date(responseData.data.time).getTime()
        } else {
          this.startTime = 0
        }
      }
    },
    $reset() {
      this.started = false
      this.startTime = 0
    }
  }
})

export { useClockStore }
