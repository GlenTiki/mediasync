import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'

import { default as SignInPanel } from '../signin'

function mapStateToProps (state) {
  return {
    selectedSigninPanel: state.signin.landingSelected,
    signinErrors: state.signin.landingErrorTracker
  }
}

function mapDispatchToProps (dispatch) {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    signinActions: bindActionCreators(SigninActions, dispatch)
  }
}

export class SigninPage extends Component {
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
  user: PropTypes.object,
  routeActions: PropTypes.object,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(SigninPage)
