import React, { PropTypes, Component } from 'react'
// import { Link } from 'react-router'

import { Link } from 'react-router'
import { Tabs, Tab, Input, ButtonInput } from 'react-bootstrap'

var validation = require('../../../isomorphic/validator.js')

const clearErrors = {
  unEmptyErrorStyle: {display: 'none'},
  unInvalidErrorStyle: {display: 'none'},
  unTakenErrorStyle: {display: 'none'},
  emailInvalidErrorStyle: {display: 'none'},
  emailTakenErrorStyle: {display: 'none'},
  pwMatchErrorStyle: {display: 'none'},
  pwCharsErrorStyle: {display: 'none'},
  termsErrorStyle: {display: 'none'},
  problemConnectingToServerErrorStyle: {display: 'none'}
}

export class SignInPanel extends Component {
  handleError (e) {
    e = e + 'Style'
    let c = Object.assign({}, clearErrors)
    c[e] = {display: 'block'}
    console.log(e, 'error:', c)
    this.props.handleError(c)
  }

  handleSignInClick (e) {
    e.preventDefault()
    let username = this.refs.usernameSI.getValue()
    let password = this.refs.passwordSI.getValue()
    let saveSignIn = this.refs.checkboxSI.getChecked()

    console.log(username, password, saveSignIn)
    this.props.handleSignIn(e)
  }

  handleSignUpClick (e) {
    e.preventDefault()
    let username = this.refs.usernameSU.getValue()
    let email = this.refs.emailSU.getValue()
    let password = this.refs.passwordSU.getValue()
    let pwRepeat = this.refs.pwRepeatSU.getValue()
    let agreeTerms = this.refs.checkboxSU.getChecked()

    var that = this
    console.log(password, pwRepeat)
    // console.log(username, email, password, pwRepeat, agreeTerms)
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
            that.props.handleSignUp({ username: username, email: email, password: password })
          } else {
            that.handleError('termsError')
          }
        })
      })
    })
  }

  render () {
    return (
      <Tabs activeKey={this.props.selected} onSelect={this.props.handleSelect}>
        <Tab eventKey={1} title='Sign in'>
          <br/>
          <form className='form-horizontal'>
            <Input type='text' ref='usernameSI' placeholder='Username' />
            <Input type='password' ref='passwordSI' placeholder='Password' />
            <Input type='checkbox' ref='checkboxSI' label='Keep me signed in' />
            <ButtonInput type='submit' value='Sign in' onClick={this.handleSignInClick.bind(this)}/>
          </form>
        </Tab>
        <Tab eventKey={2} title='Sign up'>
          <br/>
          <form className='form-horizontal'>
            <Input type='text' ref='usernameSU' placeholder='Username' />
            <Input type='email' ref='emailSU' placeholder='Email' />
            <Input type='password' ref='passwordSU' placeholder='Password' />
            <Input type='password' ref='pwRepeatSU' placeholder='Re-type Password' />
            <Input type='checkbox' ref='checkboxSU' label={<span>I agree to the <Link to='/terms'>terms and conditions</Link></span>}/>
            <ButtonInput type='submit' value='Sign up' onClick={this.handleSignUpClick.bind(this)}/>
            {/* all my error messages...*/}
            <div className='text-danger' style={this.props.errorTracker.unEmptyErrorStyle}>Usernames must not be blank!</div>
            <div className='text-danger' style={this.props.errorTracker.unInvalidErrorStyle}>Usernames must contain only letters, numbers and underscores!</div>
            <div className='text-danger' style={this.props.errorTracker.unTakenErrorStyle}>Username is taken!</div>
            <div className='text-danger' style={this.props.errorTracker.emailInvalidErrorStyle}>Email is invalid!</div>
            <div className='text-danger' style={this.props.errorTracker.emailTakenErrorStyle}>Email is taken!</div>
            <div className='text-danger' style={this.props.errorTracker.pwCharsErrorStyle}>Password needs to be at least 6 letters long and needs to have at least 1 upper case letter, 1 lower case letter and 1 number!</div>
            <div className='text-danger' style={this.props.errorTracker.pwMatchErrorStyle}>Passwords must match!</div>
            <div className='text-danger' style={this.props.errorTracker.termsErrorStyle}>You must agree to the <Link to='/terms'>Terms and conditions</Link> to sign up!</div>
            <div className='text-danger' style={this.props.errorTracker.problemConnectingToServerErrorStyle}>Issue connecting to server, please check if online!</div>
          </form>
        </Tab>
      </Tabs>
    )
  }
}

SignInPanel.propTypes = {
  selected: PropTypes.number.isRequired,
  handleSignIn: PropTypes.func.isRequired,
  handleSignUp: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  errorTracker: PropTypes.object.isRequired,
  handleError: PropTypes.func.isRequired
}
