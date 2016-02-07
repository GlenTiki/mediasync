import React, { PropTypes, Component } from 'react'
// import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

import { Link } from 'react-router'
import { Tabs, Tab, Input, ButtonInput, Button } from 'react-bootstrap'

var userApi = require('../../api/user.js')

const clearErrors = {
  signinConnectionErrorStyle: {display: 'none'},
  signinErrorStyle: {display: 'none'}
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routeActions, dispatch)
  }
}

export class SignInPanel extends Component {
  handleError (e) {
    e = e + 'Style'
    let c = Object.assign({}, clearErrors)
    c[e] = {display: 'block'}
    this.props.handleError(c)
  }

  handleSignInClick (e) {
    e.preventDefault()
    let username = this.refs.usernameSI.getValue()
    let password = this.refs.passwordSI.getValue()
    let saveSignIn = this.refs.checkboxSI.getChecked()

    var that = this

    userApi.signin({ username: username, password: password }, function (err, user) {
      if (err) return that.handleError(err.message)
      if (saveSignIn) {
        window.localStorage.setItem('mediasyncUser', JSON.stringify(user))
      } else {
        window.sessionStorage.setItem('mediasyncUser', JSON.stringify(user))
      }
      that.handleError()
      that.props.handleSignIn(user)
      that.props.routeActions.push('/')
    })
  }

  render () {
    return (
      <Tabs activeKey={this.props.selected} onSelect={this.props.handleSelect}>
        <Tab eventKey={1} title='Sign in'>
          <br/>
          <form className='form-horizontal'>
            <div className='text-danger' style={this.props.errorTracker.signinErrorStyle}>Username or password is invalid!</div>
            <Input type='text' ref='usernameSI' placeholder='Username' />
            <Input type='password' ref='passwordSI' placeholder='Password' />
            <Input type='checkbox' ref='checkboxSI' label='Keep me signed in' />
            <ButtonInput type='submit' bsStyle='primary' value='Sign in' onClick={this.handleSignInClick.bind(this)}/>
            <Link to='/forgotpassword'>Forgot your password?</Link>
            <div className='text-danger' style={this.props.errorTracker.signinConnectionErrorStyle}>Problem connecting to server!</div>
          </form>
          <h4 className='text-center'>-or-</h4>
          <Button bsStyle='primary' className='facebook-button' href='/api/auth/facebookSignin' block><span className='icon facebook-logo'/> Signin with facebook</Button>
          <Button bsStyle='primary' className='twitter-button' href='/api/auth/twitterSignin' block><span className='icon twitter-logo-white'/> Signin with twitter</Button>
        </Tab>
        <Tab eventKey={2} title='Sign up'>
          <div>
            <br/>
            <Button bsStyle='primary' className='facebook-button' href='/api/auth/facebookSignup' block><span className='icon facebook-logo'/> Signup with facebook</Button>
            <Button bsStyle='primary' className='twitter-button' href='/api/auth/twitterSignup' block><span className='icon twitter-logo-white'/> Signup with twitter</Button>
            <h4 className='text-center'>-or-</h4>
            <Link to='/signup' className='btn btn-primary btn-block'>Signup here</Link>
          </div>
        </Tab>
      </Tabs>
    )
  }
}

SignInPanel.propTypes = {
  selected: PropTypes.number.isRequired,
  handleSignIn: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  errorTracker: PropTypes.object.isRequired,
  handleError: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInPanel)
