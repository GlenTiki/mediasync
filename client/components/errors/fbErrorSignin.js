import React, { Component } from 'react'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'

export class FbErrorSignin extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>
          Problem signing in with Facebook. This is likely because you have never linked a facebook account with a mediasync account. Please create an account or sign in with your normal username and password, then navigate to your profile settings and click "add facebook account".
        </p>
        <br/>
        <Button bsStyle='primary' href='/api/auth/facebookSignup'>Signup with facebook</Button>
        <br/><br/>
        <Link to='/' className='btn btn-primary'>Signin on the home page</Link>
      </div>
    )
  }
}
