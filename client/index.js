import React from 'react'
import { render } from 'react-dom'

import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route } from 'react-router'
import { createHistory } from 'history'
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router'

import App from './containers/App'

import reducers from './reducers/TodoReducers'

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}))

const store = createStore(reducer)
const history = createHistory()

syncReduxAndRouter(history, store)

let rootElement = document.getElementById('app')
render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App}>
        <Route path='room' component={Room}/>
        <Route path='user' component={User}/>
      </Route>
    </Router>
  </Provider>,
  rootElement
)
