import { userState } from '../../Type/state';

const initialState: userState = {
  isLogged: false,
  token: '',
  username: '',
  email: '',
  userId: -1,
  role: 'user',
  teams: []
};

const userReducer = (
  state: userState = initialState,
  action: any
): userState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLogged: true,
        token: action.payload
      };
    case 'PROFILE':
      return {
          ...state,
          username: action.payload.username,
          email: action.payload.email,
          userId: action.payload.id,
          role: action.payload.role
      };
    case 'TEAMS':
      return {
          ...state,
          teams: action.payload
      };
    case 'ADD_TEAM':
      state.teams.push(action.payload);
      return {
          ...state,
      };
    case 'DELETE_TEAM':
      state.teams = state.teams.filter((team) => team.id !== action.payload);
      return {
          ...state,
      };
    case 'LOGOUT':
      return {
        isLogged: false,
        token: '',
        username: '',
        email: '',
        userId: -1,
        role: 'user',
        teams: []
      };
    default:
      return state;
  }
};

export default userReducer;
