import { handleActions } from 'redux-actions'

var user = JSON.parse(window.localStorage.getItem('mediasyncUser')) || JSON.parse(window.sessionStorage.getItem('mediasyncUser'))
var initialState
if ((user === undefined) || (user == null) || (user === 'undefined')) {
  initialState = { user: null }
} else {
  initialState = { user: user }
}

export default handleActions({
  'SIGNIN' (state, action) {
    return {
      user: action.payload
    }
  },

  'SIGNOUT' (state, action) {
    window.localStorage.setItem('mediasyncUser', null)
    window.sessionStorage.setItem('mediasyncUser', null)
    return {
      user: null
    }
  },

  'SIGNUP' (state, action) {
    window.sessionStorage.setItem('mediasyncUser', JSON.stringify(user))
    return {
      user: action.payload
    }
  }
}, initialState)
