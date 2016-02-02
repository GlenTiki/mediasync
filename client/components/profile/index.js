import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'
import * as ProfileActions from '../../actions/Profile'
// import { SignInPanel } from '../signin'

// import { Navbar, Nav, OverlayTrigger, Popover, NavDropdown, MenuItem } from 'react-bootstrap'
import { routeActions } from 'redux-simple-router'
// var userApi = require('../../api/user.js')

function mapStateToProps (state) {
  return {
    user: state.auth.user,
    selectedSigninPanel: state.signin.navSelected,
    signinErrors: state.signin.navErrorTracker
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routeActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    signinActions: bindActionCreators(SigninActions, dispatch),
    viewProfile: bindActionCreators(ProfileActions, dispatch).view
  }
}

export class Profile extends Component {
  render () {
    return (
    <div>
      yolodaskjdbasibd ad uas dc k shejcalk
    </div>
    )
  }
}

Profile.propTypes = {
  user: PropTypes.object,
  routeActions: PropTypes.object,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  viewProfile: PropTypes.func.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
