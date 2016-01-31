import React, { Component } from 'react'
import { Link } from 'react-router'

export class ValidationSuccess extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>
          Email now validated! Thanks!
        </p>
        <br/>
        <Link to='/' className='btn btn-primary'>Home</Link>
      </div>
    )
  }
}
