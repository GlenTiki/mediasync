import { handleActions } from 'redux-actions'

const initialState = {
  user: null
}

export default handleActions({
  'SIGNIN' (state, action) {
    return {
      user: {
        username: action.payload.username
      }
    }
  },

  'SIGNOUT' (state, action) {
    return {
      user: null
    }
  },

  'SIGNUP' (state, action) {
    return {
      user: {
        username: action.payload.username
      }
    }
  }
}, initialState)
