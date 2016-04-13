import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as RoomActions from '../../actions/Room'

import { routerActions } from 'react-router-redux'
import { Panel, Col, Grid, ResponsiveEmbed } from 'react-bootstrap'

import { default as io } from 'socket.io-client'

function mapStateToProps (state, own) {
  return {
    user: state.auth.user,
    roomDisplay: state.room.display,
    room: state.room.roomDetails,
    connectedCredentials: state.room.connectedDetails
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    roomActions: bindActionCreators(RoomActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch)
  }
}

export class Room extends Component {
  componentWillMount () {
    // var that = this
    // setup socket here
    var that = this
    this.socket = io('/api/sync')
    this.socket.on('connect', function () {
      var token = that.props.user ? that.props.user.token : null
      that.socket.emit('joinRoom', { roomName: that.props.routeParams.name, token: token })
    })

    this.socket.on('reconnect', () => {
      var token = that.props.user ? that.props.user.token : null
      that.socket.emit('joinRoom', { roomName: 'testing', token: token, details: that.props.connectedCredentials })
    })

    this.socket.on('roomDetails', function (data) {
      console.log(data)
    })

    this.socket.on('userLeft', function (data) {
      if (data.name === that.props.connectedCredentials.connectedName && data.username === that.props.connectedCredentials.connectedUsername) {
        var token = that.props.user ? that.props.user.token : null
        that.socket.emit('joinRoom', { roomName: 'testing', token: token, details: that.props.connectedCredentials })
      }
      console.log('a user left', data)
    })

    this.socket.on('connectionCredentials', function (cred) {
      that.props.roomActions.receivedRoomCredentials(cred)
    })

    this.socket.on('kicked', function () {
      that.props.roomActions.leaveRoom()
      that.props.routeActions.push('/enterRoomFail')
    })
  }

  componentWillUnmount () {
    // tear down socket here
    this.socket.disconnect()
  }

  render () {
    var that = this
    console.log(this)
    return (
      <div className='room' >
        <Grid fluid>
          <Col fluid sm={12} md={8}>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(0)}>Video</h3>} collapsible expanded={this.props.roomDisplay.openPanel === 0}>
              <ResponsiveEmbed a16by9>
                <iframe id='player' type='text/html' src='http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1' />
              </ResponsiveEmbed>
            </Panel>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(1)}>Search</h3>} collapsible expanded={this.props.roomDisplay.openPanel === 1}>
              Testing
            </Panel>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(2)}>Queue</h3>} collapsible expanded={this.props.roomDisplay.openPanel === 2}>
              Testing
            </Panel>
          </Col>
          <Col fluid sm={12} md={4}>
            <Panel className='sidebar' header='sidebar'>
              Testing
            </Panel>
          </Col>
        </Grid>
      </div>
    )
  }
}

Room.propTypes = {
  user: PropTypes.object,
  roomDisplay: PropTypes.object,
  room: PropTypes.object,
  connectedCredentials: PropTypes.object,
  routeActions: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  roomActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
