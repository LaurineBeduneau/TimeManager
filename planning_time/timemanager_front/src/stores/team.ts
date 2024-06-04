import type { User } from '@/models/user.model'
import api from '@/scripts/api'
import { defineStore } from 'pinia'

type TeamState = {
  selectedTeamId?: number
  members: User[]
}

const useTeamStore = defineStore({
  id: 'team',
  state: () => {
    return {
      selectedTeamId: Number(localStorage.getItem('selectedTeamId')) || undefined,
      members: []
    } as TeamState
  },

  actions: {
    getTeam() {
      this.selectedTeamId = Number(localStorage.getItem('selectedTeamId'))
    },
    async selectTeam(teamId: number | undefined) {
      this.selectedTeamId = teamId
      if (teamId) localStorage.setItem('selectedTeamId', teamId.toString())
    },
    async fetchMembers() {
      if (!this.selectedTeamId) {
        return
      }

      const response = await api.getTeamMembers(this.selectedTeamId)
      if (response.status === 200) {
        this.members = response.data.data
      }
    },
    $reset() {
      localStorage.removeItem('selectedTeamId')

      this.selectedTeamId = -1
      this.members = []
    }
  }
})

export { useTeamStore }
