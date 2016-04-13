import React, { Component } from 'react'
import { Link } from 'react-router'

export class CannotEnterRoom extends Component {
  render () {
    return (
      <div className='single-page-element'>
        <p>
          Problem entering room: maybe it doesn't exist, or you don't have the permission to get in?
        </p>
        <br/><br/>
        <Link to='/' className='btn btn-primary'>Home</Link>
      </div>
    )
  }
}
