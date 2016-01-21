import React, { PropTypes, Component } from 'react'

import Header from '../components/header/'
import Footer from '../components/footer/'

export class App extends Component {
  render () {
    return (
      <div>
        <Header />
        <div className='content'>
          {this.props.children}
          <div className='push'></div>
        </div>
        <Footer />
      </div>
    )
  }
}

App.propTypes = {
  children: PropTypes.element
}

export default App
