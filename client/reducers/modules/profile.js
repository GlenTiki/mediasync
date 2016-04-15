import { handleActions } from 'redux-actions'

var initialState = { user: null, rooms: null }

export default handleActions({
  'VIEW_PROFILE' (state, action) {
    return {
      ...state,
      user: action.payload
    }
  },
  'USER_ROOMS' (state, action) {
    console.log(action)
    return {
      ...state,
      rooms: action.payload
    }
  }
}, initialState)
