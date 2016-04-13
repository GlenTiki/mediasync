import { handleActions } from 'redux-actions'

const initialState = {
  results: []
}

export default handleActions({
  'HANDLE_RESULTS' (state, action) {
    return {
      ...state,
      results: action.payload
    }
  }
}, initialState)
