import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as ProfileActions from '../../actions/Profile'
// import { SignInPanel } from '../signin'

// import { Navbar, Nav, OverlayTrigger, Popover, NavDropdown, MenuItem } from 'react-bootstrap'
import { routerActions } from 'react-router-redux'
import { default as Profile } from './index'
// var userApi = require('../../api/user.js')

function mapStateToProps (state) {
  return {
    user: state.auth.user
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    viewProfile: bindActionCreators(ProfileActions, dispatch).view
  }
}

export class MyProfile extends Component {
  componentWillMount () {
    if (this.props.user) {
      this.props.viewProfile(this.props.user)
    } else {
      this.props.routeActions.push('/signin')
    }
  }

  render () {
    return (
      <Profile />
    )
  }
}

MyProfile.propTypes = {
  user: PropTypes.object,
  routeActions: PropTypes.object,
  viewProfile: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(MyProfile)
