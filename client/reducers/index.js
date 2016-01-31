import { default as counter } from './modules/counter'
import { default as auth } from './modules/auth'
import { default as signin } from './modules/signin'
import { default as signup } from './modules/signup'
import { routeReducer } from 'redux-simple-router'
import { combineReducers } from 'redux'

export default combineReducers({
  counter,
  auth,
  signin,
  signup,
  routeReducer
})
