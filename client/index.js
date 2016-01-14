import React from 'react'
import { render } from 'react-dom'

import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Redirect } from 'react-router'
import { createHistory } from 'history'
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router'

import App from './containers/App'

import { Foo, Bar, Zed, NotFoundView } from './components/test'

import reducers from './reducers'

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}))
const history = createHistory()
// const reduxRouterMiddleware = syncHistory(history)
// const createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware)(createStore)

const store = createStore(reducer)

syncReduxAndRouter(history, store)

let rootElement = document.getElementById('app')
render(
  <Provider store={store}>
    <Router history={history}>
    <Route path='/' component={App}>
        <IndexRoute component={Zed} />
        <Route path='foo' component={Foo}/>
        <Route path='bar' component={Bar}/>
        <Route path='/404' component={NotFoundView} />
        <Redirect from='*' to='/404' />
      </Route>
    </Router>
  </Provider>,
  rootElement
)
