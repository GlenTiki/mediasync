import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'
import { routerActions } from 'react-router-redux'

import { default as SignInPanel } from '../signin'

function mapStateToProps (state) {
  return {
    signedInUser: state.auth.user,
    selectedSigninPanel: state.signin.landingSelected,
    signinErrors: state.signin.landingErrorTracker
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    signinActions: bindActionCreators(SigninActions, dispatch)
  }
}

export class SigninPage extends Component {
  componentWillMount () {
    if (this.props.signedInUser !== null) this.props.routeActions.push('/')
  }

  render () {
    return (
      <div className='single-page-element bordered-spe'>
        <SignInPanel selected={this.props.selectedSigninPanel}
                  handleSignIn={this.props.authActions.signin}
                  handleSelect={this.props.signinActions.landingHandleSelect}
                  errorTracker={this.props.signinErrors}
                  handleError={this.props.signinActions.landingHandleError}
                  />
      </div>
    )
  }
}

SigninPage.propTypes = {
  signedInUser: PropTypes.object,
  routeActions: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(SigninPage)
