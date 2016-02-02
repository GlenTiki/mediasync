import React, { PropTypes, Component } from 'react'

export class Empty extends Component {
  render () {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

Empty.propTypes = {
  children: PropTypes.element
}
