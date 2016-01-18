import { default as counter } from './modules/counter'
import { default as login } from './modules/signedIn'
import { routeReducer } from 'redux-simple-router'
import { combineReducers } from 'redux'

export default combineReducers({
  counter,
  login,
  routeReducer
})
