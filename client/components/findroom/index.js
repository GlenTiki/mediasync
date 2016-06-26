import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as FindRoomActions from '../../actions/FindRoom'

import { routerActions } from 'react-router-redux'
import { Panel, Col } from 'react-bootstrap'
var mobile = require('is-mobile')

var roomsApi = require('../../api/room.js')
function mapStateToProps (state) {
  return {
    user: state.auth.user,
    rooms: state.findroom
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    findRoomActions: bindActionCreators(FindRoomActions, dispatch)
  }
}

export class FindRoom extends Component {
  componentWillMount () {
    var that = this
    roomsApi.getRooms(function (err, rooms) {
      if (err) {
        return
      }
      that.props.findRoomActions.handleResults(rooms)
    })
  }

  linkToRoom (room) {
    if ((room.type === 'membersOnly' && this.props.user) || room.type === 'public') {
      // console.log(modernizr)
      if (!mobile()) {
        return <h4><Link to={`/room/${encodeURIComponent(room.name)}`}>{room.name}</Link></h4>
      } else {
        return <h4><Link to={`/room/${encodeURIComponent(room.name)}/remote`}>{room.name}</Link></h4>
      }
    }
    return <h4>Room: {room.name}</h4>
  }

  linkToRoomRemote (room) {
    if (mobile()) {
      return false
    }

    if ((room.type === 'membersOnly' && this.props.user) || room.type === 'public') {
      return <h4 className='remote-listing'>
        <Link to={`/room/${encodeURIComponent(room.name)}/remote`}>
          <span className='glyphicon glyphicon-phone' aria-hidden='true' />{'  '}
          Remote Control
        </Link>
      </h4>
    }
    return false
  }

  render () {
    var that = this
    var rooms = this.props.rooms.results.map(function (room, i) {
      room = room.value
      return (
        <Col xs={12} s={6} md={4} lg={3} key={i}>
          <Panel className='room-panel' style={{height: '150px'}}>
            { that.linkToRoom(room) }
            <h5>Created by: {room.creatorUsername}</h5>
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
            { that.linkToRoomRemote(room) }
          </Panel>
        </Col>
      )
    })
    return (
      <div style={{paddingTop: '10px'}}>
        {rooms}
      </div>
    )
  }
}

FindRoom.propTypes = {
  user: PropTypes.object,
  rooms: PropTypes.object.isRequired,
  routeActions: PropTypes.object.isRequired,
  findRoomActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(FindRoom)
