import { defineStore } from 'pinia'
import api from '@/scripts/api'
import type { Role, User } from '@/models/user.model'
import { useTeamStore } from '@/stores/team'

type UserState = User & {
  logged: boolean
  fetching?: boolean
}

const useUserStore = defineStore({
  id: 'user',
  state: () => {
    return {
      id: -1,
      logged: false,
      username: '',
      email: '',
      role: 'user',
      teams: [],
      fetching: true
    } as UserState
  },

  actions: {
    async fetchUser(): Promise<boolean> {
      const teamStore = useTeamStore()

      const token = !!localStorage.getItem('token')
      if (!token) {
        return false
      }

      const response = await api.getProfile()
      if (response.status === 200) {
        const responseData = response.data

        const user = responseData.data

        this.logged = true
        this.id = user.id
        this.username = user.username
        this.email = user.email
        this.role = user.role
        this.teams = user.teams
        teamStore.getTeam()

        this.fetching = false
        return true
      } else {
        this.$reset()
        this.fetching = false
        return false
      }
    },
    async waitFetching(): Promise<void> {
      if (!this.fetching) {
        return Promise.resolve()
      }

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!this.fetching) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
    },
    setToken(token: string) {
      localStorage.setItem('token', token)
    },
    getUser(): UserState {
      return {
        logged: this.logged,
        id: this.id,
        username: this.username,
        email: this.email,
        role: this.role as Role,
        teams: this.teams
      }
    },
    setUser(user: any) {
      this.id = user.id
      this.username = user.username
      this.email = user.email
      this.role = user.role
      this.teams = user.teams
    },
    $reset() {
      const teamStore = useTeamStore()

      teamStore.$reset()
      localStorage.removeItem('token')

      this.logged = false
      this.id = -1
      this.username = ''
      this.email = ''
      this.role = 'user'
      this.teams = []
    }
  }
})

export { useUserStore }
