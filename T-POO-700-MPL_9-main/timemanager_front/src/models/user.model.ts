type User = {
  id: number
  username: string
  email: string
  role: Role
  teams: Team[]
}

type Role = 'user' | 'manager' | 'admin'

type Team = {
  id: number
  name: string
}

export type { User, Role }
