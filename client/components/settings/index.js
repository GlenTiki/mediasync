import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SettingsActions from '../../actions/Settings'

import { routeActions } from 'redux-simple-router'
import { Col, Panel, Input, Button, Modal } from 'react-bootstrap'
var usersApi = require('../../api/user.js')

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
  componentWillMount () {
    var that = this
    if (!this.props.user) {
      that.props.authActions.signout()
      that.props.routeActions.push('/')
    }
    if (this.props.location.query && this.props.location.query.fbId) {
      usersApi.saveFbId({token: this.props.user.token, fbId: this.props.location.query.fbId}, function (err, me) {
        if (err) {
          console.error('something went wrong saving FbID for user')
        } else {
          window.localStorage.setItem('mediasyncUser', JSON.stringify(me))
          that.props.authActions.signin(me)
        }
      })
    }
  }

  linkFacebook (e) {
    e.preventDefault()
    window.localStorage.setItem('settingsUser', this.props.user)
    window.location.replace('/api/auth/linkFacebook')
  }

  linkTwitter (e) {
    e.preventDefault()
    window.localStorage.setItem('settingsUser', this.props.user)
    window.location.replace('/api/auth/linkTwitter')
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
    console.log('here')
  }

  handleSaveClick () {

  }

  render () {
    var that = this
    var name = this.props.user.name
    var username = this.props.user.username
    var email = this.props.user.email
    var fbId = this.props.user.fbId
    var twitterId = this.props.user.twitterId
    return (
      <Panel className='single-page-element' header='Settings'>
        <form className='form-horizontal'>
          <Input type='text' ref='displayNameSU' placeholder='Name' label='Name' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={name}/>
          <div className='text-danger' style={this.props.errorTracker.displayNameEmptyErrorStyle}>Name must not be blank!</div>
          <div className='text-danger' style={this.props.errorTracker.displayNameLengthErrorStyle}>Name needs to be shorter than 64 characters!</div>
          <Input type='text' ref='usernameSU' placeholder='Username' label='Username' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={username}/>
          <div className='text-danger' style={this.props.errorTracker.unEmptyErrorStyle}>Usernames must not be blank!</div>
          <div className='text-danger' style={this.props.errorTracker.unInvalidErrorStyle}>Usernames must contain only letters, numbers and underscores!</div>
          <div className='text-danger' style={this.props.errorTracker.unTakenErrorStyle}>Username is taken!</div>
          <Input type='email' ref='emailSU' placeholder='Email' label='Email' labelClassName='col-sm-2' wrapperClassName='col-sm-10' defaultValue={email}/>
          <div className='text-danger' style={this.props.errorTracker.emailInvalidErrorStyle}>Email is invalid!</div>
          <div className='text-danger' style={this.props.errorTracker.emailTakenErrorStyle}>Email is taken!</div>
          <div className='form-group'>
            <Col sm={2} text-align='left'><strong>Facebook</strong></Col>
            <Col sm={10}>{
              fbId === ''
              ? <Button bsStyle='primary' type='submit' className='facebook-button' onClick={that.linkFacebook.bind(this)} block><span className='icon facebook-logo'/>Link to facebook</Button>
              : <strong> linked! </strong>
            }</Col>
          </div>
          <div className='form-group'>
            <Col sm={2} text-align='left'><strong>Twitter</strong></Col>
            <Col sm={10}>{
              twitterId === ''
              ? <Button bsStyle='primary' type='submit' className='twitter-button' onClick={that.linkTwitter.bind(this)} block><span className='icon twitter-logo-white'/>Link to twitter</Button>
              : <strong> linked! </strong>
            }</Col>
          </div>
          <Input type='password' ref='currPWForm' placeholder='Current Password' wrapperClassName='col-sm-12' />
          <Button bsStyle='primary' type='submit' onClick={this.handleSaveClick.bind(this)} block>Save</Button>
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
