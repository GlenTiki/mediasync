import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'
import * as ProfileActions from '../../actions/Profile'
import { Loading } from '../loading'

// import { Navbar, Nav, OverlayTrigger, Popover, NavDropdown, MenuItem } from 'react-bootstrap'
import { routerActions } from 'react-router-redux'
var userApi = require('../../api/user.js')

function mapStateToProps (state) {
  return {
    user: state.profile.user,
    selectedSigninPanel: state.signin.navSelected,
    signinErrors: state.signin.navErrorTracker
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    signinActions: bindActionCreators(SigninActions, dispatch),
    viewProfile: bindActionCreators(ProfileActions, dispatch).view
  }
}

export class Profile extends Component {
  componentWillMount () {
    // no user? lets do a lookup
    var that = this
    if (this.props.user === null) {
      userApi.getUserByUsername(this.props.routeParams.username, function (err, user) {
        if (err) that.props.routeActions.push('/userNotFound')
        that.props.viewProfile(user)
      })
    } else {
      // maybe we should do something?
    }
  }

  userSignedIn () {
    return (
      <div>
        <img src={`/api/users/pics/${this.props.user.username}`} />
        profile for {this.props.user.username}<br/>
      </div>
    )
  }

  loading () {
    return (
      <Loading />
    )
  }

  render () {
    return (
    <div>
      <Loading />
      { this.loading() }
      { this.props.user
        ? this.userSignedIn()
        : this.loading()
      }
      yolodaskjdbasibd ad uas dc k shejcalk
    </div>
    )
  }
}

Profile.propTypes = {
  user: PropTypes.object,
  routeActions: PropTypes.object,
  routeParams: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  viewProfile: PropTypes.func.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
