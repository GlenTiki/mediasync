import React, { Component } from 'react'
import { Link } from 'react-router'

export class BadToken extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>
          Problem verifying your access token. Please log in again.
        </p>
        <Link to='/' className='btn btn-primary'>Signin on the home page</Link>
      </div>
    )
  }
}
