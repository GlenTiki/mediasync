import React from 'react'
import { render } from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Redirect } from 'react-router'
import { syncHistory } from 'redux-simple-router'
import { createHistory } from 'history'

import {default as App} from './containers/App'

import { Foo, Bar, NotFoundView } from './components/test'
import { FbErrorSignup, FbErrorSignin, TwitterErrorSignup, TwitterErrorSignin } from './components/errors'
import { default as Landing } from './components/landing'
import { default as Signin } from './components/signin/signinPage'
import { Terms } from './components/terms'
import { About } from './components/about'
import { Blog } from './components/blog'
import { Help } from './components/help'
import { Guidelines } from './components/guidelines'
import { ForgotPassword } from './components/forgotpassword'
import { default as SignUp } from './components/signup'
import { SignupSuccessful } from './components/signup/signupSuccessful'
import { ValidationSuccess } from './components/signup/validationSuccess'

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
        <Route path='foo' component={Foo} />
        <Route path='bar' component={Bar} />
        <Route path='terms' component={Terms} />
        <Route path='about' component={About} />
        <Route path='help' component={Help} />
        <Route path='guidelines' component={Guidelines} />
        <Route path='blog' component={Blog} />
        <Route path='forgotpassword' component={ForgotPassword} />
        <Route path='signup' component={SignUp} />
        <Route path='signin' component={Signin} />
        <Route path='signupSuccessful' component={SignupSuccessful} />
        <Route path='validationSuccess' component={ValidationSuccess} />
        <Route path='fbErrorSignup' component={FbErrorSignup} />
        <Route path='fbErrorSignin' component={FbErrorSignin} />
        <Route path='twitterErrorSignup' component={TwitterErrorSignup} />
        <Route path='twitterErrorSignin' component={TwitterErrorSignin} />
        <Route path='/404' component={NotFoundView} />
        <Redirect from='*' to='/404' />
      </Route>
    </Router>
  </Provider>,
  rootElement
)
