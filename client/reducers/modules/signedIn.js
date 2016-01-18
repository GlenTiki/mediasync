import { handleActions } from 'redux-actions'

const initialState = {
  user: null
}

export default handleActions({
  'LOGIN' (state, action) {
    return {
      user: {
        username: action.payload.username
      }
    }
  },

  'LOGOUT' (state, action) {
    return {
      user: null
    }
  }
}, initialState)
