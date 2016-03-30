import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as CreateRoomActions from '../../actions/CreateRoom'

import { routeActions } from 'redux-simple-router'
import { Panel, Input } from 'react-bootstrap'
var usersApi = require('../../api/user.js')
var roomsApi = require('../../api/room.js')

function mapStateToProps (state) {
  return {
    user: state.auth.user,
    selectedSigninPanel: state.signin.navSelected,
    errorTracker: state.createroom.errorTracker,
    showPlaybackControllers: state.createroom.showPlaybackControllers,
    showInvitedUsers: state.createroom.showInvitedUsers
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routeActions, dispatch),
    createRoomActions: bindActionCreators(CreateRoomActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch)
  }
}

export class CreateRoom extends Component {
  componentDidMount () {
    var that = this
    if (!this.props.user) {
      that.props.authActions.signout()
      that.props.routeActions.push('/')
      return
    }
    if (this.props.location.query) {
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
        usersApi.saveFbId({token: token, twitterId: this.props.location.query.twitterId}, function (err, me) {
          if (err) {
            console.error('something went wrong saving twitterID for user')
          } else {
            that.props.authActions.signin(me)
          }
        })
      }
    }
  }

  createARoom (e) {
    e.preventDefault()
    var name = this.refs.roomName.getValue()
    var type = this.refs.roomType.getValue()
    var playback = this.refs.roomPlayback.getValue()
    var controllers = []
    if (playback === 'friends') {
      controllers = this.refs.controllers.getValue().trim().toLowerCase().split(',')
      controllers.push(this.props.user.username)
      controllers.filter(function (c, i) {
        // if the index of the current element is not the first occurance of it
        // in the array, the element is not unique
        return controllers.indexOf(c) === i
      })
    } else if (playback === 'me') {
      controllers = [this.props.user.username]
    }


    console.log(name, type, playback, controllers)
  }

  handleTypeChange () {
    var type = this.refs.roomType.getValue()
    this.props.createRoomActions.handleTypeChange(type === 'private')
  }

  handlePlaybackChange () {
    var playback = this.refs.roomPlayback.getValue()
    this.props.createRoomActions.handlePlaybackChange(playback === 'friends')
  }

  render () {
    return (
      <Panel className='single-page-element' header='Create a room'>
        <form className='form-horizontal'>
          <Input type='text' ref='roomName' placeholder='Cool Room Name' label='Name' labelClassName='col-sm-2' wrapperClassName='col-sm-10'/>
          <div className='text-danger' style={this.props.errorTracker.nameEmptyErrorStyle}>Name must not be blank!</div>
          <div className='text-danger' style={this.props.errorTracker.nameLengthErrorStyle}>Name needs to be shorter than 256 characters!</div>
          <Input type='select' ref='roomType' label='Type' placeholder='public' labelClassName='col-sm-2' wrapperClassName='col-sm-10' onChange={this.handleTypeChange.bind(this)}>
            <option value='public'>Public</option>
            <option value='private'>Invite only</option>
            <option value='unlisted'>Unlisted</option>
            <option value='membersOnly'>Mediasync Members Only</option>
          </Input>
          {
            this.props.showInvitedUsers
            ? <Input type='text' ref='invited' placeholder='Who should be able enter?' label='Who should be able enter the room?' wrapperClassName='col-sm-12'/>
            : void 0
          }
          <Input type='select' ref='roomPlayback' label='Who can change the playback in this room?' placeholder='me' wrapperClassName='col-sm-12' onChange={this.handlePlaybackChange.bind(this)}>
            <option value='me'>Just Me</option>
            <option value='anyone'>Anyone</option>
            <option value='friends'>People I Choose</option>
          </Input>
          {
            this.props.showPlaybackControllers
            ? <Input type='text' ref='controllers' placeholder='Who should be able to control playback?' label='Who should be able to control playback?' wrapperClassName='col-sm-12'/>
            : void 0
          }
          <button type='button' className='btn btn-primary btn-block' onClick={this.createARoom.bind(this)} block>Create Room</button>
        </form>
      </Panel>
    )
  }
}

CreateRoom.propTypes = {
  user: PropTypes.object,
  showPlaybackControllers: PropTypes.bool.isRequired,
  showInvitedUsers: PropTypes.bool.isRequired,
  routeActions: PropTypes.object.isRequired,
  errorTracker: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  createRoomActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateRoom)
