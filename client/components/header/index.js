import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'
import * as ProfileActions from '../../actions/Profile'
import { default as SignInPanel } from '../signin'

import { Navbar, Nav, OverlayTrigger, Popover, NavDropdown } from 'react-bootstrap'
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

export class Header extends Component {
  viewMyProfile (e) {
    e.preventDefault()
    this.props.viewProfile(this.props.user)
    this.props.routeActions.push(`/profile/${this.props.user.username}`)
  }

  render () {
    return (
    <Navbar inverse fixedTop fluid className='my-nav'>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to='/'>
            <img height='25px' width='auto' src='/assets/images/logo.png' />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <li role='presentation'><Link to='/foo'>foo</Link></li>
          <li role='presentation'><Link to='/bar'>bar</Link></li>
          {
            this.props.user
            ? <NavDropdown className='point-at' eventKey={1} title={this.props.user.username} id='basic-nav-dropdown'>
                  <li><a onClick={this.viewMyProfile.bind(this)}>Profile</a></li>
                  <li><Link to='/settings'>Settings</Link></li>
              </NavDropdown>
            : void (0)
          }
          <li role='presentation'>
            {
              this.props.user
              ? <a className='point-at' onClick={() => { this.props.authActions.signout(); this.props.routeActions.push('/') }}>
                  Signout
                </a>
              : <OverlayTrigger container={this} trigger='click' rootClose placement='bottom'
                    overlay={
                        <Popover className='nav-signin' id={2}>
                              <SignInPanel selected={this.props.selectedSigninPanel}
                                    handleSignIn={this.props.authActions.signin}
                                    handleSelect={this.props.signinActions.navHandleSelect}
                                    errorTracker={this.props.signinErrors}
                                    handleError={this.props.signinActions.navHandleError}
                                    />
                        </Popover>
                      }>
                <a className='hidden-xs point-at'>Signin</a>
              </OverlayTrigger>
            }
          </li>
          {
            this.props.user
            ? void (0)
            : <NavDropdown className='visible-xs point-at' eventKey={3} title='Signin' id='basic-nav-dropdown'>
                  <li><Link to='/signin'>signin</Link></li>
                  <li><Link to='/signup'>signup</Link></li>
              </NavDropdown>
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    )
  }
}

Header.propTypes = {
  user: PropTypes.object,
  routeActions: PropTypes.object,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  viewProfile: PropTypes.func.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
