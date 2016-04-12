import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as RoomActions from '../../actions/Room'

import { routerActions } from 'redux-simple-router'
import { Accordion, Panel } from 'react-bootstrap'

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
    return (
      <div>
        <Accordion>
          <Panel header='Video' eventKey='1'>
            Testing
          </Panel>
          <Panel header='Search' eventKey='2'>
            Testing
          </Panel>
          <Panel header='Queue' eventKey='3'>
            Testing
          </Panel>
        </Accordion>
      </div>
    )
  }
}

Room.propTypes = {
  user: PropTypes.object,
  showPlaybackControllers: PropTypes.bool.isRequired,
  showInvitedUsers: PropTypes.bool.isRequired,
  routeActions: PropTypes.object.isRequired,
  errorTracker: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  createRoomActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
