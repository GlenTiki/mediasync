import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as ProfileActions from '../../actions/Profile'
// import { SignInPanel } from '../signin'

// import { Navbar, Nav, OverlayTrigger, Popover, NavDropdown, MenuItem } from 'react-bootstrap'
import { routeActions } from 'redux-simple-router'
// var userApi = require('../../api/user.js')

function mapStateToProps (state) {
  return {
    user: state.auth.user
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routeActions, dispatch),
    viewProfile: bindActionCreators(ProfileActions, dispatch).view
  }
}

export class MyProfile extends Component {
  render () {
    if (this.props.user) {
      this.props.viewProfile(this.props.user)
    } else {
      this.props.routeActions.push('/signin')
    }
    return (
    <div>
      yolodaskjdbasibd ad uas dc k shejcalk
    </div>
    )
  }
}

MyProfile.propTypes = {
  user: PropTypes.object,
  routeActions: PropTypes.object,
  viewProfile: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(MyProfile)
