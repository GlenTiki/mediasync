import React, { Component } from 'react'

import { Link } from 'react-router'

let styles = {}

styles.pullLeft = {
  clear: 'left'
}

styles.pullRight = {
  clear: 'right'
}

styles.logo = {
  height: '30px',
  width: 'auto'
}

export default class Header extends Component {
  render () {
    return (
      <div style={styles.wrapper}>
        <div style={styles.pullLeft}>
          <Link to='/'><img style={styles.logo}src='/assets/images/logo.png' /></Link>
        </div>
        <div style={styles.pullRight}>
          <Link to='/foo'><p style={styles.link}>Foo</p></Link>{' '}
          <Link to='/bar'><p style={styles.link}>Bar</p></Link>
        </div>
      </div>
    )
  }
}
