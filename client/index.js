import React from 'react'
import { render } from 'react-dom'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Redirect, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'

import { default as App } from './containers/App'
import { Empty } from './containers/Empty'

import { NotFoundView } from './components/notFound'
import { FbErrorSignup, FbErrorSignin, TwitterErrorSignup, TwitterErrorSignin, BadToken, CannotEnterRoom } from './components/errors'
import { UserNotFoundError } from './components/profile/userNotFoundError'
import { default as Landing } from './components/landing'
import { default as Profile } from './components/profile'
import { default as Settings } from './components/settings'
import { default as Room } from './components/room/index'
import { default as RoomRemote } from './components/room/roomRemote'
import { default as CreateRoom } from './components/createroom'
import { default as FindRoom } from './components/findroom'
import { default as myProfile } from './components/profile/mine'
import { default as Signin } from './components/signin/signinPage'
import { Terms } from './components/terms'
import { About } from './components/about'
import { Blog } from './components/blog'
import { Help } from './components/help'
import { Guidelines } from './components/guidelines'
import { ForgotPassword } from './components/forgotpassword'
import { default as Signup } from './components/signup'
import { SignupSuccessful } from './components/signup/signupSuccessful'
import { ValidationSuccess } from './components/signup/validationSuccess'

import * as reducers from './reducers'

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
})
const middleware = routerMiddleware(browserHistory)
const store = createStore(reducer, applyMiddleware(middleware))
const history = syncHistoryWithStore(browserHistory, store)

let rootElement = document.getElementById('app')

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App}>
        <IndexRoute component={Landing} />
        <Route path='terms' component={Terms} />
        <Route path='about' component={About} />
        <Route path='help' component={Help} />
        <Route path='guidelines' component={Guidelines} />
        <Route path='blog' component={Blog} />
        <Route path='profile' component={Empty} >
          <IndexRoute component={myProfile} />
          <Route path='/profile/:username' component={Profile}/>
        </Route>
        <Route path='createroom' component={CreateRoom} />
        <Route path='room' component={Empty} >
          <IndexRoute component={CreateRoom} />
          <Route path='/room/:name' component={Empty}>
            <IndexRoute component={Room} />
            <Route path='/room/:name/remote' component={RoomRemote}/>
          </Route>
        </Route>
        <Route path='findroom' component={FindRoom} />
        <Route path='settings' component={Settings} />
        <Route path='forgotpassword' component={ForgotPassword} />
        <Route path='signup' component={Signup} />
        <Route path='signin' component={Signin} />
        <Route path='signupSuccessful' component={SignupSuccessful} />
        <Route path='validationSuccess' component={ValidationSuccess} />
        <Route path='userNotFound' component={UserNotFoundError} />
        <Route path='fbErrorSignup' component={FbErrorSignup} />
        <Route path='fbErrorSignin' component={FbErrorSignin} />
        <Route path='twitterErrorSignup' component={TwitterErrorSignup} />
        <Route path='twitterErrorSignin' component={TwitterErrorSignin} />
        <Route path='badToken' component={BadToken} />
        <Route path='enterRoomFail' component={CannotEnterRoom} />
        <Route path='/404' component={NotFoundView} />
        <Redirect from='*' to='/404' />
      </Route>
    </Router>
  </Provider>,
  rootElement
)
