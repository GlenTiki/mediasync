import React, { PropTypes, Component } from 'react'
// import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { routerActions } from 'react-router-redux'

import { Link } from 'react-router'
import { Panel, Input, Button } from 'react-bootstrap'

var validation = require('../../../isomorphic/validator.js')
var userApi = require('../../api/user.js')
var ReCAPTCHA = require('react-google-recaptcha')
var capKey = require('../../../config/recaptcha').client

import * as AuthActions from '../../actions/Auth'
import * as SignupActions from '../../actions/Signup'

function mapStateToProps (state) {
  return {
    signedInUser: state.auth.user,
    errorTracker: state.signup.errorTracker
  }
}

function mapDispatchToProps (dispatch) {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    signupActions: bindActionCreators(SignupActions, dispatch),
    routeActions: bindActionCreators(routerActions, dispatch),
    dispatch: dispatch
  }
}

const clearErrors = {
  displayNameEmptyErrorStyle: {display: 'none'},
  displayNameLengthErrorStyle: {display: 'none'},
  unEmptyErrorStyle: {display: 'none'},
  unInvalidErrorStyle: {display: 'none'},
  unTakenErrorStyle: {display: 'none'},
  emailInvalidErrorStyle: {display: 'none'},
  emailTakenErrorStyle: {display: 'none'},
  pwMatchErrorStyle: {display: 'none'},
  pwCharsErrorStyle: {display: 'none'},
  termsErrorStyle: {display: 'none'},
  captchaErrorStyle: {display: 'none'},
  problemConnectingToServerErrorStyle: {display: 'none'}
}

export class SignUp extends Component {
  componentWillMount () {
    if (this.props.signedInUser !== null) this.props.routeActions.push('/')
  }

  handleError (e) {
    e = e + 'Style'
    let c = Object.assign({}, clearErrors)
    c[e] = {display: 'block'}
    this.props.signupActions.handleError(c)
  }

  handleSignUpClick (e) {
    e.preventDefault()
    let name = this.refs.displayNameSU.getValue()
    let username = this.refs.usernameSU.getValue()
    let email = this.refs.emailSU.getValue()
    let password = this.refs.passwordSU.getValue()
    let pwRepeat = this.refs.pwRepeatSU.getValue()
    let fbId = this.refs.fbSU.getValue()
    let twitterId = this.refs.twitterSU.getValue()
    let agreeTerms = this.refs.checkboxSU.getChecked()
    let captcha = this.refs.captcha.getValue()

    if (captcha === null) return this.handleError('captchaError')

    var that = this
    // console.log(username, email, password, pwRepeat, agreeTerms)
    validation.validateDisplayName(name, function (err, res) {
      if (err) {
        return that.handleError(err.message)
      }
      validation.validateUsername(username, function (err, res) {
        if (err) {
          return that.handleError(err.message)
        }
        validation.validateEmail(email, function (err, res) {
          if (err) {
            return that.handleError(err.message)
          }
          validation.validatePassword(password, pwRepeat, function (err, res) {
            if (err) {
              return that.handleError(err.message)
            }
            if (agreeTerms) {
              userApi.create({ name: name, username: username, email: email,
                                password: password, fbId: fbId, twitterId: twitterId,
                                captcha: captcha }, function (err, user) {
                if (err) {
                  return that.handleError(err.message)
                }
                that.handleError()
                // console.log(that)
                that.props.authActions.signup(user)
                that.props.routeActions.push('/signupSuccessful')
              })
            } else {
              that.handleError('termsError')
            }
          })
        })
      })
    })
  }

  render () {
    var name = this.props.location.query && this.props.location.query.name || ''
    var username = this.props.location.query && this.props.location.query.username || ''
    var email = this.props.location.query && this.props.location.query.email || ''
    var fbId = this.props.location.query && this.props.location.query.fb || ''
    var twitterId = this.props.location.query && this.props.location.query.twitter || ''
    return (
      <Panel className='single-page-element' header='Sign up'>
        <form className='form-horizontal'>
          <Input type='text' ref='displayNameSU' placeholder='Name' label='Name' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={name}/>
          <div className='text-danger' style={this.props.errorTracker.displayNameEmptyErrorStyle}>Name must not be blank!</div>
          <div className='text-danger' style={this.props.errorTracker.displayNameLengthErrorStyle}>Name needs to be shorted than 64 characters!</div>
          <Input type='text' ref='usernameSU' placeholder='Username' label='Username' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={username}/>
          <div className='text-danger' style={this.props.errorTracker.unEmptyErrorStyle}>Usernames must not be blank!</div>
          <div className='text-danger' style={this.props.errorTracker.unInvalidErrorStyle}>Usernames must contain only letters, numbers and underscores!</div>
          <div className='text-danger' style={this.props.errorTracker.unTakenErrorStyle}>Username is taken!</div>
          <Input type='email' ref='emailSU' placeholder='Email' label='Email' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={email}/>
          <div className='text-danger' style={this.props.errorTracker.emailInvalidErrorStyle}>Email is invalid!</div>
          <div className='text-danger' style={this.props.errorTracker.emailTakenErrorStyle}>Email is taken!</div>
          <Input type='password' ref='passwordSU' placeholder='Password' label='Password' labelClassName='col-sm-2' wrapperClassName='col-sm-10'/>
          <Input type='password' ref='pwRepeatSU' placeholder='Re-type Password' label='Retype' labelClassName='col-sm-2' wrapperClassName='col-sm-10'/>
          <div className='text-danger' style={this.props.errorTracker.pwCharsErrorStyle}>Password needs to be at least 6 letters long and needs to have at least 1 letter and 1 number!</div>
          <div className='text-danger' style={this.props.errorTracker.pwMatchErrorStyle}>Passwords must match!</div>
          <Input type='checkbox' ref='checkboxSU' label={<span>I agree to the <Link to='/terms'>terms and conditions</Link></span>}/>
          <div className='text-danger' style={this.props.errorTracker.termsErrorStyle}>You must agree to the <Link to='/terms'>Terms and conditions</Link> to sign up!</div>
          {/* !!!!verify not bot!!!! */}
          <ReCAPTCHA className='center-align' ref='captcha' sitekey={capKey} onChange={function (val) {}} />
          <div className='text-danger' style={this.props.errorTracker.captchaErrorStyle}>Captcha problem.</div>
          <Button bsStyle='primary' type='submit' onClick={this.handleSignUpClick.bind(this)} block>Sign up</Button>
          <div className='text-danger' style={this.props.errorTracker.problemConnectingToServerErrorStyle}>Issue connecting to server, please check if online!</div>
          <Input type='hidden' ref='fbSU' defaultValue={fbId} />
          <Input type='hidden' ref='twitterSU' defaultValue={twitterId} />
        </form>
        <Button bsStyle='primary' className='facebook-button' href='/api/auth/facebookSignup' block><span className='icon facebook-logo'/> Signup with facebook</Button>
        <Button bsStyle='primary' className='twitter-button' href='/api/auth/twitterSignup' block><span className='icon twitter-logo-white'/> Signup with twitter</Button>
      </Panel>
    )
  }
}

SignUp.propTypes = {
  signedInUser: PropTypes.object,
  location: PropTypes.object.isRequired,
  errorTracker: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  routeActions: PropTypes.object.isRequired,
  signupActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
