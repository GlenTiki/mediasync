import React, { Component } from 'react'

import { Link } from 'react-router'

let styles = {}

styles.wrapper = {
  padding: '10px 20px',
  overflow: 'hidden'
}

styles.pullLeft = {
  clear: 'left'
}

styles.pullRight = {
  clear: 'right'
}

export default class Header extends Component {
  render () {
    return (
      <div style={styles.wrapper}>
        <div style={style.pullLeft}>
          <Link to='/'><img src='/images/logo.png' /></Link>
        </div>
        <div style={style.pullRight}>
          <Link to='/findroom'>Find a room</Link>
        </div>
      </div>
    )
  }
}

Header.defaultProps = {
  user: null
}
