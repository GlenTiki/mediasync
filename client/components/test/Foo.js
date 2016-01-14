import React, { Component, PropTypes } from 'react'

export default class Foo extends Component {
  render () {
    return (
      <p style={{color: (this.props.clicked ? '#050' : '#005')}}
        onClick={this.props.onClick}>
        foo
      </p>
    )
  }
}

Foo.propTypes = {
  onClick: PropTypes.func.isRequired,
  clicked: PropTypes.bool.isRequired
}
