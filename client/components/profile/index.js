import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'
import * as ProfileActions from '../../actions/Profile'
import { Loading } from '../loading'
import { Panel, Col } from 'react-bootstrap'

// import { Navbar, Nav, OverlayTrigger, Popover, NavDropdown, MenuItem } from 'react-bootstrap'
import { routerActions } from 'react-router-redux'
var userApi = require('../../api/user.js')
var roomsApi = require('../../api/room.js')

function mapStateToProps (state) {
  return {
    user: state.profile.user,
    rooms: state.profile.rooms,
    viewingUser: state.auth.user,
    selectedSigninPanel: state.signin.navSelected,
    signinErrors: state.signin.navErrorTracker
  }
}

function mapDispatchToProps (dispatch) {
  console.log('dispatch', ProfileActions)
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    signinActions: bindActionCreators(SigninActions, dispatch),
    viewProfile: bindActionCreators(ProfileActions, dispatch).view,
    viewUsersRooms: bindActionCreators(ProfileActions, dispatch).userRooms
  }
}

export class Profile extends Component {
  componentWillMount () {
    // no user? lets do a lookup
    var that = this
    console.log(this)
    if (this.props.user === null) {
      userApi.getUserByUsername(this.props.routeParams.username, function (err, user) {
        if (err) that.props.routeActions.push('/userNotFound')
        that.props.viewProfile(user)
        roomsApi.getUsersRooms(user.id, function (err, rooms) {
          if (err) console.log(err)
          that.props.viewUsersRooms(rooms)
        })
      })
    } else {
      if (this.props.rooms === null) {
        roomsApi.getUsersRooms(that.props.user.id, function (err, rooms) {
          if (err) console.log(err)
          that.props.viewUsersRooms(rooms)
        })
      }
      // maybe we should do something?
    }
  }

  componentWillUnmount () {
    this.props.viewProfile(null)
    this.props.viewUsersRooms(null)
  }

  userSignedIn () {
    return (
      <div className='single-page-element bordered-spe'>
        <h1>{this.props.user.username}</h1>
        <div><img src={`/api/users/pic/${this.props.user.username}`} height='250' width='250'/></div>
        <h3>Name: {this.props.user.name}</h3>
      </div>
    )
  }

  usersRooms () {
    var that = this
    if (!that.props.rooms) return false
    return this.props.rooms.map(function (room, i) {
      room = room.value
      return (
        <Col xs={12} s={6} md={4} lg={3} key={i}>
          <Panel>
            {
              room.type === 'membersOnly' && that.props.viewingUser
              ? <h4><Link to={`/room/${encodeURIComponent(room.name)}`}>Room: {room.name}</Link></h4>
              : room.type === 'public' || room.type === 'unlisted' || room.type !== 'private'
                ? <h4><Link to={`/room/${encodeURIComponent(room.name)}`}>Room: {room.name}</Link></h4>
                : room.type === 'private' && that.props.viewingUser && room.invitedUsers.indexOf(that.props.viewingUser.id) > -1
                  ? <h4><Link to={`/room/${encodeURIComponent(room.name)}`}>Room: {room.name}</Link></h4>
                  : <h4>Room: {room.name}</h4>
            }
            <h5>{
              (function () {
                switch (room.playback) {
                  case 'me':
                  case 'owner':
                    return 'Only the owner can change the media playback in here!'
                  case 'public':
                    return 'Anybody can change the media playback in here!'
                  case 'friends':
                    return 'Only users chosen by the owner can change the media playback in here!'
                }
              })()
            }</h5>
            {
              room.type === 'membersOnly' && !that.props.user
              ? <h5> Members only room, sign up to get in! </h5>
              : false
            }
          </Panel>
        </Col>
      )
    })
  }

  loading () {
    return (
      <Loading />
    )
  }

  render () {
    console.log(this)
    return (
    <div>
      {
        this.props.user
        ? <div>
          {this.userSignedIn()}
          {this.usersRooms()}
        </div>
        : this.loading()
      }
    </div>
    )
  }
}

Profile.propTypes = {
  user: PropTypes.object,
  rooms: PropTypes.array,
  routeActions: PropTypes.object,
  routeParams: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  viewProfile: PropTypes.func.isRequired,
  viewUsersRooms: PropTypes.func.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
