import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as SigninActions from '../../actions/Signin'
import * as SigninPanelActions from '../../actions/SigninPanel'
import { SignInPanel } from '../signin'

import { Col, Image, Glyphicon, Panel } from 'react-bootstrap'

function mapStateToProps (state) {
  return {
    user: state.signin.user,
    selectedSigninPanel: state.signinPanel.landingSelected,
    signinErrors: state.signinPanel.landingErrorTracker
  }
}

function mapDispatchToProps (dispatch) {
  return {
    signinActions: bindActionCreators(SigninActions, dispatch),
    signinPanelActions: bindActionCreators(SigninPanelActions, dispatch)
  }
}

export class Landing extends Component {
  render () {
    console.log(this)
    return (
    <div>
      <Image className='landing-image' src='/assets/images/landing.jpg' responsive />
      <Col className='landing-content' xs={12}>
        <Panel className='quick-about'>
          <h1>Welcome to <img height='40em' width='auto' src='/assets/images/logo.png'/></h1>
          <br/>
          Sign up, sign in and make yourself at home.<br/>
          Kick back and listen to some music or watch a video... with a friend.
        </Panel>
        <Panel className='landing-signin'>
          <SignInPanel selected={this.props.selectedSigninPanel}
                        handleSignIn={this.props.signinActions.signin}
                        handleSignUp={this.props.signinActions.signup}
                        handleSelect={this.props.signinPanelActions.landingHandleSelect}
                        errorTracker={this.props.signinErrors}
                        handleError={this.props.signinPanelActions.landingHandleError}
                        />
        </Panel>
        <Col xs={12} md={4}>
          <h2>Create your own rooms!</h2>
          Seamlessly create a room and build a community with easy to manage user permissions within it!
        </Col>
        <Col xs={12} md={4}>
          <h2>Find popular rooms!</h2>
          With the "find a room" feature, you can search for popular rooms and meet people close to you with similiar interests.
        </Col>
        <Col xs={12} md={4}>
          <h2>Share and enjoy!</h2>
          This project has been built <span className='love'>(with LOVE <Glyphicon glyph='heart'/>)</span> by Glen Keane at WIT for his final year project. He would love if you would share and enjoy this with friends!
        </Col>
      </Col>
    </div>
    )
  }
}

Landing.propTypes = {
  user: PropTypes.object,
  signinActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinPanelActions: PropTypes.object.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing)
