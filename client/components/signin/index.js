import React, { PropTypes, Component } from 'react'
// import { Link } from 'react-router'

import { Link } from 'react-router'
import { Tabs, Tab, Input, ButtonInput } from 'react-bootstrap'

export class SignInPanel extends Component {
  handleSignInClick (e) {
    e.preventDefault()

    this.props.handleError({
      ...this.props.errorTracker,
      pwMatchErrorStyle: {display: 'none'},
      pwLengthErrorStyle: {display: 'none'},
      termsErrorStyle: {display: 'none'}
    })

    let username = this.refs.usernameSI.getValue()
    let password = this.refs.passwordSI.getValue()
    let saveSignIn = this.refs.checkboxSI.getChecked()

    console.log(username, password, saveSignIn)
    this.props.handleSignIn(e)
  }

  handleSignUpClick (e) {
    e.preventDefault()
    let username = this.refs.usernameSU.getValue()
    let password = this.refs.passwordSU.getValue()
    let pwRepeat = this.refs.pwRepeatSU.getValue()
    let agreeTerms = this.refs.checkboxSU.getChecked()

    console.log(username, password, pwRepeat, agreeTerms)

    if (agreeTerms) {
      if (password.length > 6) {
        if (password === pwRepeat) {
          if (password.contains()) {

          } else {
            this.props.handleError({
              pwMatchErrorStyle: {display: 'none'},
              pwCharsErrorStyle: {display: 'block'},
              pwLengthErrorStyle: {display: 'none'},
              termsErrorStyle: {display: 'none'}
            })
          }
        } else {
          this.props.handleError({
            pwMatchErrorStyle: {display: 'block'},
            pwCharsErrorStyle: {display: 'none'},
            pwLengthErrorStyle: {display: 'none'},
            termsErrorStyle: {display: 'none'}
          })
        }
      } else {
        this.props.handleError({
          pwMatchErrorStyle: {display: 'none'},
          pwCharsErrorStyle: {display: 'none'},
          pwLengthErrorStyle: {display: 'block'},
          termsErrorStyle: {display: 'none'}
        })
      }
    } else {
      this.props.handleError({
        pwMatchErrorStyle: {display: 'none'},
        pwCharsErrorStyle: {display: 'none'},
        pwLengthErrorStyle: {display: 'none'},
        termsErrorStyle: {display: 'block'}
      })
    }
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
            <Input type='password' ref='passwordSU' placeholder='Password' />
            <Input type='password' ref='pwRepeatSU' placeholder='Re-type Password' />
            <Input type='checkbox' ref='checkboxSU' label={<span>I agree to the <Link to='/terms'>terms and conditions</Link></span>}/>
            <ButtonInput type='submit' value='Sign up' onClick={this.handleSignUpClick.bind(this)}/>
            <div className='text-danger' style={this.props.errorTracker.pwLengthErrorStyle}>
              Passwords needs to be longer than 6 characters!
            </div>
            <div className='text-danger' style={this.props.errorTracker.pwMatchErrorStyle}>
              Passwords need to match!
            </div>
            <div className='text-danger' style={this.props.errorTracker.pwMatchErrorStyle}>
              Password needs to have a combination of upper and lower case letters, and at least 1 number!
            </div>
            <div className='text-danger' style={this.props.errorTracker.termsErrorStyle}>
              You must agree to the <Link to='/terms'>Terms and conditions</Link> to continue.
            </div>
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
