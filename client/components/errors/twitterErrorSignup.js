import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

export class TwitterErrorSignup extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>Problem signing up with twitter. This is likely because your twitter account is associated with another mediasync user. Try signing in with twitter.</p>
        <Button bsStyle='primary' href='/api/auth/twitterSignin'>Signin with twitter</Button>
      </div>
    )
  }
}
