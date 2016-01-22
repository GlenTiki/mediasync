import { default as counter } from './modules/counter'
import { default as signin } from './modules/signedIn'
import { default as signinPanel } from './modules/signinPanel'
import { routeReducer } from 'redux-simple-router'
import { combineReducers } from 'redux'

export default combineReducers({
  counter,
  signin,
  signinPanel,
  routeReducer
})
