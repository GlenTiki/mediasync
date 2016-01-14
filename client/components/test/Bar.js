import React, { Component, PropTypes } from 'react'

export default class Bar extends Component {
  render () {
    return (
      <p style={{color: (this.props.clicked ? '#005' : '#050')}}
        onClick={this.props.onClick}>
        bar
      </p>
    )
  }
}

Bar.propTypes = {
  onClick: PropTypes.func.isRequired,
  clicked: PropTypes.bool.isRequired
}
