import React, { Component } from 'react'
import { Link } from 'react-router'

export class SignupSuccessful extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>
          Thank you for signing up to MediaSync! You will need to verify your email if you want to create a room.
        </p>
        <br/>
        <Link to='/' className='btn btn-primary'>Home</Link>
      </div>
    )
  }
}
