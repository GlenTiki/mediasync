import { default as counter } from './modules/counter'
import { routeReducer } from 'redux-simple-router'
import { combineReducers } from 'redux'

export default combineReducers({
  counter,
  routeReducer
})
