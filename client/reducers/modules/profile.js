import { handleActions } from 'redux-actions'

var initialState = { user: null }

export default handleActions({
  'VIEW_PROFILE' (state, action) {
    return {
      user: action.payload
    }
  }
}, initialState)
