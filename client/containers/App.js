import React, { PropTypes, Component } from 'react'

import Header from '../components/header/Header'

export class App extends Component {
  render () {
    return (
      <div>
        <Header />
        {this.props.children}
      </div>
    )
  }
}

App.propTypes = {
  children: PropTypes.element
}

export default App
