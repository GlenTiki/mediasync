import React, { Component, PropTypes } from 'react'
// import { connect } from 'react-redux'

import Header from '../components/header/Header'

export default class App extends Component {
  render () {
    return (
      <div>
        <Header/>
        <div style={{marginTop: '1.5em'}}>{this.props.children}</div>
      </div>
    )
  }
}

App.propTypes = {
  children: PropTypes.element
}

// // injecting global state
// function select(state) {
//   return {
//     visibleTodos: selectTodos(state.todos, state.visibilityFilter),
//     visibilityFilter: state.visibilityFilter
//   }
// }
//
// // Wrap the component to inject dispatch and state into it
// export default connect(select)(App)
