import axios, { type AxiosInstance } from 'axios'

class API {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/',
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
  }

  /**
   * @summary set token to header
   */
  private setToken() {
    const token = localStorage.getItem('token')
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `${token}`
    }
  }

  /**
   * @summary login user
   * @param email user email
   * @param password user password
   * @returns response
   */
  public async login(email: string, password: string) {
    const body = JSON.stringify({
      user: {
        email: email,
        password: password
      }
    })
    const response = await this.instance
      .post('/users/auth/login', body)
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary register user
   * @param email user email
   * @param password user password
   * @param passwordConfirmation user password confirmation
   * @returns response
   */
  public async register(
    email: string,
    username: string,
    password: string,
    passwordConfirmation: string
  ) {
    const body = JSON.stringify({
      user: {
        email: email,
        username: username,
        password: password,
        password_confirmation: passwordConfirmation
      }
    })
    const response = await this.instance.post('/users/auth/signup', body, {
      validateStatus: (status) => status === 200 || status === 422
    })
    return response
  }

  /**
   * @summary check if user is authenticated & admin
   * @returns true if user is authenticated & admin, false otherwise
   */
  public async isAdmin() {
    this.setToken()
    const response = await this.instance
      .get('/users/admin')
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary get all users (admin only)
   * @returns response
   */
  public async getUsers() {
    this.setToken()
    const response = await this.instance
      .get('/users/admin/users')
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary update user (admin only)
   * @param userId user id
   * @param username user username
   * @param email user email
   * @param role user role
   * @returns response
   */
  public async updateUser(userId: number, username: string, email: string, role: string) {
    this.setToken()
    const body = JSON.stringify({
      user: {
        username: username,
        email: email,
        role: role
      }
    })
    const response = await this.instance
      .put(`/users/admin/user/${userId}`, body)
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary get user profile
   * @returns response
   */
  public async getProfile() {
    this.setToken()
    const response = await this.instance.get('/users/profile', {
      validateStatus: (status) => status === 200 || status === 401
    })
    return response
  }

  /**
   * @summary update user profile
   * @param username user username
   * @param email user email
   * @param password user password
   * @param newPassword user's new password
   * @returns response
   */
  public async updateProfile(
    username: string,
    email: string,
    password: string,
    newPassword: string
  ) {
    this.setToken()
    const body = {
      user: {
        username: username,
        email: email,
        password: password,
        new_password: newPassword
      }
    }
    const response = await this.instance.put('/users/profile', JSON.stringify(body), {
      validateStatus: (status) => status === 200 || status === 422
    })
    return response
  }

  /**
   * @summary get all projects
   * @param userId user id
   * @returns
   */
  public async getWorkingTimes(userId: number) {
    this.setToken()
    const response = await this.instance
      .get(`/workingtimes/${userId}`)
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  // Création api clockin, clockout, pause, resume + token
  public async clockIn() {
    this.setToken()
    const response = await this.instance
      .post('/clocks/clockin')
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary Create a team
   * @param name team name
   */
  public async createTeam(name: string) {
    this.setToken()
    const body = JSON.stringify({
      team: {
        name: name
      }
    })
    const response = await this.instance
      .post('/teams', body)
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary Get latest clock
   */
  public async getClock() {
    this.setToken()
    const response = await this.instance.get('/clocks', {
      validateStatus: (status) => status === 200 || status === 404
    })
    return response
  }

  /**
   * @summary Remove a user
   */
  public async removeUser(userId: number) {
    this.setToken()
    const response = await this.instance.delete(`/users/admin/user/${userId}`)
    return response
  }

  /**
   * @summary Get all teams
   */
  public async getTeams() {
    this.setToken()
    const response = await this.instance.get('/teams')
    return response
  }

  /**
   * @summary Get team
   */
  public async getTeamMembers(teamId: number) {
    this.setToken()
    const response = await this.instance.get(`/teams/${teamId}/members`)
    return response
  }

  /**
   * @summary Remove a team (admin only)
   */
  public async removeTeamAdmin(teamId: number) {
    this.setToken()
    const response = await this.instance.delete(`/teams/admin/team/${teamId}`)
    return response
  }

  /**
   * @summary Remove a team
   */
  public async removeTeam(teamId: number) {
    this.setToken()
    const response = await this.instance.delete(`/teams/${teamId}`)
    return response
  }

  /**
   * @summary Update a team (admin only)
   */
  public async updateTeamAdmin(teamId: number, name: string) {
    this.setToken()
    const body = JSON.stringify({
      team: {
        name: name
      }
    })
    const response = await this.instance.put(`/teams/admin/team/${teamId}`, body)
    return response
  }

  /**
   * @summary Update a team
   */
  public async updateTeam(teamId: number, name: string) {
    this.setToken()
    const body = JSON.stringify({
      team: {
        name: name
      }
    })
    const response = await this.instance.put(`/teams/${teamId}`, body)
    return response
  }

  /**
   * @summary Add member to a team
   */
  public async addTeamMember(teamId: number, userId: number) {
    this.setToken()
    const body = JSON.stringify({
      user: {
        user_id: userId
      }
    })
    const response = await this.instance.put(`/teams/${teamId}/add`, body)
    return response
  }

  /**
   * @summary Remove member from a team
   */
  public async removeTeamMember(teamId: number, userId: number) {
    this.setToken()
    const body = JSON.stringify({
      user: {
        user_id: userId
      }
    })
    const response = await this.instance.put(`/teams/${teamId}/remove`, body)
    return response
  }

  /**
   * @summary Remove my account
   */
  public async removeMyAccount() {
    this.setToken()
    const response = await this.instance.delete('/users/profile')
    return response
  }

  /**
   * @summary Get workingtimes for a user (manager only)
   * @param userId user id
   */
  public async getWorkingTimesManager(userId: number) {
    this.setToken()
    const response = await this.instance.get(`/workingtimes/manager/${userId}`)
    return response
  }

  /**
   * @summary Get user by username
   * @param username user username
   */
  public async getUserByUsername(username: string) {
    this.setToken()
    const response = await this.instance.get(`/users/manager/${username}`, {
      validateStatus: (status) => status === 200 || status === 404
    })
    return response
  }
}

export default new API()
