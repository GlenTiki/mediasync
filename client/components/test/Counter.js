import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/Counter'

function mapStateToProps (state) {
  console.log(state)
  return {
    counter: state.counter.value
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  }
}

export class Counter extends Component {
  render () {
    console.log(this.props)
    return (
      <div>
        <p>
          Zed
        </p>
        <p>
          {this.props.counter}
        </p>
        <button className='btn btn-default' onClick={() => this.props.actions.increment()}>
          Increment
        </button>
        <button className='btn btn-default' onClick={() => this.props.actions.increment(3)}>
          Increment by 3
        </button>
        <button className='btn btn-default' onClick={() => this.props.actions.decrement()}>
          Decrement
        </button>
      </div>
    )
  }
}

Counter.propTypes = {
  counter: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter)
