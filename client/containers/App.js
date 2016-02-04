import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

import Header from '../components/header/'
import Footer from '../components/footer/'
import * as AuthActions from '../actions/Auth'

var usersApi = require('../api/user.js')

function mapStateToProps (state) {
  return {
    user: state.auth.user
  }
}

function mapDispatchToProps (dispatch) {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    routeActions: bindActionCreators(routeActions, dispatch)
  }
}

export class App extends Component {
  componentDidMount () {
    // this should be called on the very first page we navigate to.
    // lets do some auth stuff in here!
    var that = this
    if (this.props.location.query && this.props.location.query.token) {
      usersApi.me(this.props.location.query.token, function (err, me) {
        if (err) {
          that.props.authActions.signout()
          that.props.routeActions.push('/')
        } else {
          window.localStorage.setItem('mediasyncUser', JSON.stringify(me))
          that.props.authActions.signin(me)
          that.props.routeActions.push('/')
        }
      })
    }
    if (this.props.user) {
      usersApi.me(this.props.user.token, function (err) {
        if (err) {
          that.props.authActions.signout()
          that.props.routeActions.push('/badToken')
        }
      })
    }
    // this.context.redux.getState()
  }

  render () {
    return (
      <div>
        <Header />
        <div className='content'>
          {this.props.children}
          <div className='push'></div>
        </div>
        <Footer />
      </div>
    )
  }
}

App.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  routeActions: PropTypes.object.isRequired,
  children: PropTypes.element
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
