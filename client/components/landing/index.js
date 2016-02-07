import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'
import { default as SignInPanel } from '../signin'
import { compliments } from './compliments'

import { Col, Image, Glyphicon, Panel } from 'react-bootstrap'

function randomComplement () {
  return compliments[Math.floor(Math.random() * compliments.length)]
}

function mapStateToProps (state) {
  return {
    user: state.auth.user,
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

export class Landing extends Component {
  render () {
    // console.log(this.props.user)
    return (
    <div>
      <Col className='landing-image-wrap' xs={12}>
        <Image className='landing-image' src='/assets/images/landing.jpg' alt='mediasync' responsive />
      </Col>
      <Col className='landing-content' xs={12}>
        <Panel className='quick-about'>
          <h1>Welcome to <img height='40em' width='auto' src='/assets/images/logo.png'/></h1>
          <br/>
          Sign up, sign in and make yourself at home.<br/>
          Kick back and listen to some music or watch a video... with a friend.
        </Panel>
        <Panel className='landing-user'>
          { this.props.user
            ? <div>
                <h2> Welcome back, {this.props.user.name}.</h2>
                <p>{randomComplement()}</p>
              </div>
            : <SignInPanel selected={this.props.selectedSigninPanel}
                        handleSignIn={this.props.authActions.signin}
                        handleSelect={this.props.signinActions.landingHandleSelect}
                        errorTracker={this.props.signinErrors}
                        handleError={this.props.signinActions.landingHandleError}
                        />
          }
        </Panel>
        <Col xs={12} md={4}>
          <h2>
            <span className='glyphicon glyphicon-home' aria-hidden='true' />{'  '}
            Create your own rooms!
          </h2>
          Seamlessly create a room and build a community with similiar interests! MediaSync allows you to easily create a room where you can watch videos or listen to music in sync with your friends. It also gives the creator control over user permissions within their room.
        </Col>
        <Col xs={12} md={4}>
          <h2>
            <span className='glyphicon glyphicon-search' aria-hidden='true' />{'  '}
            Find popular rooms!
          </h2>
          With the 'find a room' feature, you can search for popular rooms and meet people close to you with similiar interests.
        </Col>
        <Col xs={12} md={4}>
          <h2>
            <span className='glyphicon glyphicon-share' aria-hidden='true' />{'  '}
            Share and enjoy!
          </h2>
          This project has been built <span className='love'>(with LOVE <Glyphicon glyph='heart'/>)</span> by Glen Keane at WIT for his final year project. He would love if you would share and enjoy this with friends!
        </Col>
      </Col>
    </div>
    )
  }
}

Landing.propTypes = {
  user: PropTypes.object,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing)
