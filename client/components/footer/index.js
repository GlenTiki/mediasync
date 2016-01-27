import React, { Component } from 'react'
import { Link } from 'react-router'
import { Col } from 'react-bootstrap'

export default class Footer extends Component {
  render () {
    return (
      <footer className='footer'>
        <Col md={12} lg={2}/>
        <Col xs={12} sm={6} md={3} lg={2}>
          <Link to='/'>
            <img height='20px' width='auto' src='/assets/images/logo.png' style={{margin: '10px 0'}}/>
          </Link>
          <br/>
          Copyright 2016 <a href='http://glenkeane.me/about'>Glen Keane</a><br/>
          <Link to='/terms'>Terms And Conditions</Link>
        </Col>
        <Col xs={12} sm={6} md={3} lg={2}>
          <h4>Website</h4>
          <Link to='/about'>About</Link><br/>
          <Link to='/blog'>Blog</Link>
        </Col>
        <Col xs={12} sm={6} md={3} lg={2}>
          <h4>Support</h4>
          <Link to='/help'>Help</Link><br/>
          <Link to='/guidelines'>Community guidelines</Link>
        </Col>
        <Col xs={12} sm={6} md={3} lg={2}>
          <h4>Follow the Creator</h4>
          <a href='https://twitter.com/thekemkid'>
            <img src='/assets/images/twitter-logo.png' height='25em' width='auto'/>
          </a>{'  '}
          <a href='https://www.facebook.com/thekemkid'>
            <img src='/assets/images/facebook-logo.png' height='25em' width='auto'/>
          </a>{'  '}
          <a href='https://www.instagram.com/thekemkid/'>
            <img src='/assets/images/instagram-logo.png' height='25em' width='auto'/>
          </a>
        </Col>
        <Col md={12} lg={2}/>
      </footer>
    )
  }
}
