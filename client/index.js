import React from 'react'
import { render } from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Redirect } from 'react-router'
import { syncHistory } from 'redux-simple-router'
import { createHistory } from 'history'

import App from './containers/App'

import { Foo, Bar, Counter, NotFoundView } from './components/test'
import { default as Landing } from './components/landing'
import { Terms } from './components/terms'

import reducer from './reducers'

const history = createHistory()
const reduxRouterMiddleware = syncHistory(history)
const createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware)(createStore)
const store = createStoreWithMiddleware(reducer)

// Required for replaying actions from devtools to work
// reduxRouterMiddleware.listenForReplays(store)

let rootElement = document.getElementById('app')

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App}>
        <IndexRoute component={Landing} />
        <Route path='about' component={Counter} />
        <Route path='foo' component={Foo} />
        <Route path='bar' component={Bar} />
        <Route path='terms' component={Terms} />
        <Route path='/404' component={NotFoundView} />
        <Redirect from='*' to='/404' />
      </Route>
    </Router>
  </Provider>,
  rootElement
)
