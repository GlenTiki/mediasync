import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SettingsActions from '../../actions/Settings'

import { routeActions } from 'redux-simple-router'
import { Col, Panel, Input, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
var async = require('async')
var usersApi = require('../../api/user.js')
var validator = require('../../../isomorphic/validator')

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
  problemConnectingToServerErrorStyle: {display: 'none'},
  currPWMatchFormErrorStyle: {display: 'none'},
  successStyle: {display: 'none'}
}

function mapStateToProps (state) {
  return {
    user: state.auth.user,
    selectedSigninPanel: state.signin.navSelected,
    errorTracker: state.settings.errorTracker,
    displayModal: state.settings.displayChangePasswordModal
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routeActions, dispatch),
    settingsActions: bindActionCreators(SettingsActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch)
  }
}

export class Settings extends Component {
  componentDidMount () {
    var that = this
    if (!this.props.user) {
      that.props.authActions.signout()
      that.props.routeActions.push('/')
      return
    }
    if (this.props.location.query && (this.props.location.query.fbId || this.props.location.query.twitterId)) {
      var token = JSON.parse(window.localStorage.getItem('settingsUser')).token
      if (this.props.location.query.fbId) {
        usersApi.saveFbId({token: token, fbId: this.props.location.query.fbId}, function (err, me) {
          if (err) {
            console.error('something went wrong saving FbID for user')
          } else {
            that.props.authActions.signin(me)
          }
        })
      }
      if (this.props.location.query.twitterId) {
        usersApi.saveTwitterId({token: token, twitterId: this.props.location.query.twitterId}, function (err, me) {
          if (err) {
            console.error('something went wrong saving twitterID for user')
          } else {
            that.props.authActions.signin(me)
          }
        })
      }
    }
  }

  handleError (e) {
    e = e + 'Style'
    let c = Object.assign({}, clearErrors)
    c[e] = {display: 'block'}
    this.props.settingsActions.handleError(c)
  }

  linkFacebook (e) {
    e.preventDefault()
    window.localStorage.setItem('settingsUser', JSON.stringify(this.props.user))
    window.location.replace('/api/auth/linkFacebook')
  }

  unlinkFacebook (e) {
    e.preventDefault()
    var that = this
    usersApi.saveFbId({token: this.props.user.token, fbId: ''}, function (err, me) {
      if (err) {
        console.error('something went wrong saving FbID for user')
      } else {
        that.props.authActions.signin(me)
      }
    })
    // window.localStorage.setItem('settingsUser', this.props.user)
    // window.location.replace('/api/auth/unlinkFacebook')
  }

  linkTwitter (e) {
    e.preventDefault()
    window.localStorage.setItem('settingsUser', JSON.stringify(this.props.user))
    window.location.replace('/api/auth/linkTwitter')
  }

  unlinkTwitter (e) {
    e.preventDefault()
    var that = this
    usersApi.saveTwitterId({token: this.props.user.token, twitterId: ''}, function (err, me) {
      if (err) {
        console.error('something went wrong saving twitterID for user')
      } else {
        that.props.authActions.signin(me)
      }
    })
    // window.localStorage.setItem('settingsUser', this.props.user)
    // window.location.replace('/api/auth/unlinkFacebook')
  }

  handleChangePasswordClick (e) {
    e.preventDefault()

    this.props.settingsActions.showPasswordModal(true)
  }

  closeModal (e) {
    e.preventDefault()

    this.props.settingsActions.showPasswordModal(false)
  }

  handleUpdatePassword (e) {
    e.preventDefault()
    // TODO update password
    console.log('here')
  }

  handleSaveClick (e) {
    e.preventDefault()
    var saveData = {
      token: this.props.user.token,
      name: this.refs.displayName.getValue(),
      username: this.refs.username.getValue(),
      email: this.refs.email.getValue(),
      password: this.refs.currPWForm.getValue()
    }
    var that = this

    async.waterfall([
      validateUsername,
      validateEmail,
      validateName
    ], updateUser)

    function validateUsername (done) {
      if (that.props.user.username === saveData.username) {
        console.log('same username')
        done(null)
      } else {
        validator.validateUsername(saveData.username, function (err, res) {
          if (err) {
            console.log('diff UN invalid')
            return done(err)
          } else {
            console.log('diff UN valid')
            return done(null)
          }
        })
      }
    }

    function validateEmail (done) {
      if (that.props.user.email === saveData.email) {
        console.log('same email')
        done(null)
      } else {
        validator.validateEmail(saveData.email, function (err, res) {
          if (err) {
            console.log('diff email invalid')
            return done(err)
          } else {
            console.log('diff email valid')
            return done(null)
          }
        })
      }
    }

    function validateName (done) {
      if (that.props.user.name === saveData.name) {
        console.log('same name')
        done(null)
      } else {
        validator.validateDisplayName(saveData.name, function (err, res) {
          if (err) {
            console.log('diff name invalid')
            return done(err)
          } else {
            console.log('diff name valid')
            return done(null)
          }
        })
      }
    }

    function updateUser (err) {
      if (err) {
        console.log('err', err)
        return that.handleError(err.message)
      }

      console.log('saveData', saveData)
      usersApi.update(saveData, function (err, newState) {
        console.log('before update', that.props.user)
        console.log('after', newState)
        if (err) {
          console.error('Everything is wrong with the world!')
          console.error('but mostly this:', err)
          that.handleError(err.message)
          return
          // TODO: display error to user
        }
        that.props.authActions.signin(newState)
        that.handleError('success')
      })
    }
  }

  resendVerification (e) {
    e.preventDefault()
    usersApi.resendVerification({token: this.props.user.token}, function (err, user) {
      if (err) {
        // do something I guess?
        console.error('something went wrong resending verification')
        console.error(err)
        return
      }
      // do something else?
      // TODO: user feedback
    })
  }

  render () {
    var that = this
    var name = this.props.user.name
    var username = this.props.user.username
    var email = this.props.user.email
    var fbId = this.props.user.fbId
    var twitterId = this.props.user.twitterId
    var tooltip = <Tooltip id='3'>You must validate your email to edit this field.</Tooltip>
    return (
      <Panel className='single-page-element' header='Settings'>
        <form className='form-horizontal'>
          <Input type='text' ref='displayName' placeholder='Name' label='Name' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={name} />
          <div className='text-danger' style={this.props.errorTracker.displayNameEmptyErrorStyle}>Name must not be blank!</div>
          <div className='text-danger' style={this.props.errorTracker.displayNameLengthErrorStyle}>Name needs to be shorter than 64 characters!</div>
          {
            this.props.user.emailValidated
            ? <Input type='text' ref='username' placeholder='Username' label='Username' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={username}/>
            : <OverlayTrigger
                overlay={tooltip} placement='top'
                delayShow={300} delayHide={150}
              >
                <Input type='text' ref='username' placeholder='Username' label='Username' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={username} disabled/>
              </OverlayTrigger>
          }
          <div className='text-danger' style={this.props.errorTracker.unEmptyErrorStyle}>Usernames must not be blank!</div>
          <div className='text-danger' style={this.props.errorTracker.unInvalidErrorStyle}>Usernames must contain only letters, numbers and underscores!</div>
          <div className='text-danger' style={this.props.errorTracker.unTakenErrorStyle}>Username is taken!</div>
          <Input type='email' ref='email' placeholder='Email' label='Email' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={email}/>
          {
            this.props.user.emailValidated
            ? <div className='text-success'> Email Validated. </div>
            : <div>
                <span className='text-warning'> Email not validated yet </span>
                <Button bsStyle='primary' type='submit' onClick={this.resendVerification.bind(this)}>Resend Verification Email</Button>
              </div>
          }
          <div className='text-danger' style={this.props.errorTracker.emailInvalidErrorStyle}>Email is invalid!</div>
          <div className='text-danger' style={this.props.errorTracker.emailTakenErrorStyle}>Email is taken!</div>
          <div className='form-group'>
            <Col sm={2} text-align='left'><strong>Facebook</strong></Col>
            <Col sm={10}>{
              fbId === ''
              ? <Button bsStyle='primary' type='submit' className='facebook-button' onClick={that.linkFacebook.bind(this)} block><span className='icon facebook-logo'/>Link to facebook</Button>
              : <span><strong> linked! </strong> <Button bsStyle='danger' type='submit' onClick={that.unlinkFacebook.bind(this)}>unlink</Button></span>
            }</Col>
          </div>
          <div className='form-group'>
            <Col sm={2} text-align='left'><strong>Twitter</strong></Col>
            <Col sm={10}>{
              twitterId === ''
              ? <Button bsStyle='primary' type='submit' className='twitter-button' onClick={that.linkTwitter.bind(this)} block><span className='icon twitter-logo-white'/>Link to twitter</Button>
              : <span><strong> linked! </strong> <Button bsStyle='danger' type='submit' onClick={that.unlinkTwitter.bind(this)}>unlink</Button></span>
            }</Col>
          </div>
          <Input type='password' ref='currPWForm' placeholder='Current Password' wrapperClassName='col-sm-12' />
          <div className='text-danger' style={this.props.errorTracker.currPWMatchFormErrorStyle}>Password issue, try reenter it!</div>
          <div className='text-danger' style={this.props.errorTracker.problemConnectingToServerErrorStyle}>Issue connecting to server, please check if online!</div>
          <Button bsStyle='primary' type='submit' onClick={this.handleSaveClick.bind(this)} block>Save</Button>
          <div className='text-success' style={this.props.errorTracker.successStyle}>Success!</div>
          <br/>
          <Button bsStyle='primary' type='submit' onClick={this.handleChangePasswordClick.bind(this)} block>Change your password here</Button>
        </form>

        <Modal show={this.props.displayModal} onHide={this.closeModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Change your password!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <form className='form-horizontal'>
            <Input type='password' ref='newPW' placeholder='New Password' />
            <Input type='password' ref='repeatNewPW' placeholder='Re-type Password' />
            <div className='text-danger' style={this.props.errorTracker.pwCharsErrorStyle}>Password needs to be at least 6 letters long and needs to have at least 1 upper case letter, 1 lower case letter and 1 number!</div>
            <div className='text-danger' style={this.props.errorTracker.pwMatchErrorStyle}>Passwords must match!</div>
            <Input type='password' ref='currPWModal' placeholder='Current Password' />
            <div className='text-danger' style={this.props.errorTracker.problemConnectingToServerErrorStyle}>Issue connecting to server, please check if online!</div>
          </form>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle='primary' type='submit' onClick={that.handleUpdatePassword.bind(that)}>Update Password</Button>
            <Button onClick={that.closeModal.bind(that)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Panel>
    )
  }
}

Settings.propTypes = {
  user: PropTypes.object,
  displayModal: PropTypes.bool.isRequired,
  routeActions: PropTypes.object.isRequired,
  errorTracker: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  settingsActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
