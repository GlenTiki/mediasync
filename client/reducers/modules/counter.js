import { handleActions } from 'redux-actions'

const initialState = {
  value: 1
}

export default handleActions({
  'COUNTER_INCREMENT' (state, action) {
    return {
      value: state.value + action.payload
    }
  },

  'COUNTER_DECREMENT' (state, action) {
    return {
      value: state.value - action.payload
    }
  }
}, initialState)
