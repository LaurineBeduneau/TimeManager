import { legacy_createStore as createStore } from 'redux';
import userReducer from './Reducer/user';

// const initialState = {};

// const rootReducer = (state = initialState, _action: any) => {
//   return state;
// };

const store = createStore(userReducer);

export default store;
