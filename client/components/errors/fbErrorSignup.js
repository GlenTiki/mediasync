import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

export class FbErrorSignup extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>Problem signing up with Facebook. This is likely because your facebook account is associated with another mediasync user. Try signing in with facebook.</p>
        <Button bsStyle='primary' href='/api/auth/facebookSignin'>Signin with facebook</Button>
      </div>
    )
  }
}
