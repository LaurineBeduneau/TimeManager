import axios, { type AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class API {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: 'https://timemanager.lemeyeur.fr/api',
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });
  }

  /**
   * @summary get token from local
   */
  private async getToken() {
    const token = await AsyncStorage.getItem('token');
    return token;
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
    });
    const response = await this.instance
      .post('/users/auth/login', body)
      .then((response) => response)
      .catch((error) => error);
    return response;
  }

  /**
   * @summary register user
   * @param email user email
   * @param password user password
   * @param name user name
   * @returns response
   */
  public async register(
    email: string,
    username: string,
    password: string,
    name: string
  ) {
    const body = JSON.stringify({
      user: {
        email: email,
        username: username,
        password: password,
        name: name
      }
    });
    const response = await this.instance
      .post('/users/auth/signup', body)
      .then((response) => response)
      .catch((error) => error.response);
    return response;
  }

  /**
   * @summary get user profile
   * @returns response
   */
  public async getProfile() {
    const response = await this.instance
      .get('/users/profile', {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary update user profile
   * @param username username
   * @param email user email
   * @param password user password
   * @param newPassword user new password
   */
  public async updateProfile(username: string, email: string, password: string, newPassword: string) {
    const body = JSON.stringify({
      user: {
        username: username,
        email: email,
        password: password,
        new_password: newPassword
      }
    })
    const response = await this.instance
      .put('/users/profile', body, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary get all users (admin only)
   * @returns response
   */
  public async getUsers() {
    const response = await this.instance
      .get('/users/admin/users', {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }


    /**
   * @summary update user (admin only)
   * @param userId user id
   * @param teamId team id
   * @param role user role
   * @returns response
   */
    public async updateUser(userId: number, username: string, teamId: string, role: string) {
      const body = JSON.stringify({
        user: {
          username: username,
          team_id: teamId,
          role: role
        }
      })
      const response = await this.instance
        .put(`/users/admin/user/${userId}`, {headers: {Authorization: await this.getToken()}, body})
        .then((response) => response)
        .catch((error) => error.response)
      return response
    }

  /**
   * @summary get user clocks
   * @returns response
   */
  public async getClocks() {
    const response = await this.instance
      .get('/clocks', {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary create clock for user (or stop it if already started)
   * @returns response
   */
  public async createClock() {
    const response = await this.instance
      .post('/clocks/clockin', {}, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary get all working times for user
   * @param userId user id
   * @returns response
   */
  public async getWorkingTimes(userId: number) {
    const response = await this.instance
      .get(`/workingtimes/${userId}`, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  /**
   * @summary create new team
   * @param name team name
   * @returns response
    */
  public async createTeam(name: string) {
    const body = JSON.stringify({
      team: {
        name: name
      }
    })

    const response = await this.instance
      .post('/teams', body, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  public async getTeamsForUser() {
    const response = await this.instance
      .get('/teams/my', {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  public async getUsersForManager() {
    const response = await this.instance
      .get('/users/manager/users', {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  public async getTeams() {
    const response = await this.instance
      .get('/teams', {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  public async addMemberToTeam(teamId: number, userId: number) {
    const body = JSON.stringify({
      user: {
        user_id: userId
      }
    })

    const response = await this.instance
      .put(`/teams/${teamId}/add`, body, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  public async removeMemberFromTeam(teamId: number, userId: number) {
    const body = JSON.stringify({
      user: {
        user_id: userId
      }
    })

    const response = await this.instance
      .put(`/teams/${teamId}/remove`, body, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  public async getTeamMembers(teamId: number) {
    const response = await this.instance
      .get(`/users/manager/team/${teamId}`, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
    return response
  }

  public async deleteTeam(teamId: number) {
    const response = await this.instance
      .delete(`/teams/${teamId}`, {headers: {Authorization: await this.getToken()}})
      .then((response) => response)
      .catch((error) => error.response)
      return response
  }
}

export default new API();
