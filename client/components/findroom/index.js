import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as FindRoomActions from '../../actions/FindRoom'

import { routerActions } from 'react-router-redux'
import { Panel, Col } from 'react-bootstrap'
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
      if (err) return
      that.props.findRoomActions.handleResults(rooms)
    })
  }

  render () {
    var that = this
    var rooms = this.props.rooms.results.map(function (room, i) {
      room = room.value
      return (
        <Col xs={12} s={6} md={4} lg={3} key={i}>
          <Panel style={{height: '150px'}}>
            {
              room.type === 'membersOnly' && that.props.user
              ? <h4><Link to={`/room/${encodeURIComponent(room.name)}`}>Room: {room.name}</Link></h4>
              : room.type === 'public'
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
            {
              room.type === 'membersOnly' && that.props.user
              ? <h4><Link to={`/room/${encodeURIComponent(room.name)}/remote`}>Remote Control</Link></h4>
              : room.type === 'public'
                ? <h4><Link to={`/room/${encodeURIComponent(room.name)}/remote`}>Remote Control</Link></h4>
              : false
            }
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
