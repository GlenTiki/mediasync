import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as RoomActions from '../../actions/Room'

import { routerActions } from 'react-router-redux'
import { Panel, Col, Grid } from 'react-bootstrap'

function mapStateToProps (state) {
  return {
    user: state.auth.user,
    room: state.room,
    errorTracker: state.createroom.errorTracker,
    showPlaybackControllers: state.createroom.showPlaybackControllers,
    showInvitedUsers: state.createroom.showInvitedUsers
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
  }

  componentWillUnmount () {
    // tear down socket here
  }

  render () {
    var that = this
    return (
      <div className='room' >
        <Grid fluid>
          <Col fluid sm={12} md={8}>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(0)}>Video</h3>} collapsible expanded={this.props.room.openPanel === 0}>
              Testing
            </Panel>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(1)}>Search</h3>} collapsible expanded={this.props.room.openPanel === 1}>
              Testing
            </Panel>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(2)}>Queue</h3>} collapsible expanded={this.props.room.openPanel === 2}>
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
  room: PropTypes.object,
  showPlaybackControllers: PropTypes.bool.isRequired,
  showInvitedUsers: PropTypes.bool.isRequired,
  routeActions: PropTypes.object.isRequired,
  errorTracker: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  roomActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
