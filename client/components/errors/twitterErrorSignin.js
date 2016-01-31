import React, { Component } from 'react'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'

export class TwitterErrorSignin extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>
          Problem signing in with Twitter. This is likely because you have never linked a twitter account with a mediasync account. Please create an account or sign in with your normal username and password, then navigate to your profile settings and click "add twitter account".
        </p>
        <br/>
        <Button bsStyle='primary' href='/api/auth/twitterSignup'>Signup with twitter</Button>
        <br/><br/>
        <Link to='/' className='btn btn-primary'>Signin on the home page</Link>
      </div>
    )
  }
}
