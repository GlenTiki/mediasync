import React, { Component } from 'react'
import { Link } from 'react-router'

export class UserNotFoundErrorSignin extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>
          The user you are looking for could not be found.
        </p>
        <br/><br/>
        <Link to='/' className='btn btn-primary'>Go home</Link>
      </div>
    )
  }
}
