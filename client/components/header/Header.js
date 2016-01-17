import React, { Component } from 'react'

import { Link } from 'react-router'

import { Navbar, Nav } from 'react-bootstrap'

export default class Header extends Component {
  render () {
    return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to='/'>
            <img height='30px' width='auto' src='/assets/images/logo.png' />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <li role='presentation'><Link to='/foo'>foo</Link></li>
          <li role='presentation'><Link to='/bar'>bar</Link></li>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    )
  }
}
