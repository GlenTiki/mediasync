import React, { Component } from 'react'
import { Link } from 'react-router'
import { Col } from 'react-bootstrap'

export default class Footer extends Component {
  render () {
    return (
      <footer className='footer'>
        <Col xs={12} md={8}>
          Made by <a href='glenkeane.me/about'>Glen Keane</a> for his final year project!
        </Col>
        <Col xs={12} md={4}>
          <Link to='/about'>About</Link>
        </Col>
      </footer>
    )
  }
}
