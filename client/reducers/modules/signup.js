import { handleActions } from 'redux-actions'

const initialErrorStyle = {
  displayNameEmptyErrorStyle: {display: 'none'},
  displayNameLengthErrorStyle: {display: 'none'},
  unEmptyErrorStyle: {display: 'none'},
  unInvalidErrorStyle: {display: 'none'},
  unTakenErrorStyle: {display: 'none'},
  emailInvalidErrorStyle: {display: 'none'},
  emailTakenErrorStyle: {display: 'none'},
  pwMatchErrorStyle: {display: 'none'},
  pwCharsErrorStyle: {display: 'none'},
  termsErrorStyle: {display: 'none'},
  problemConnectingToServerErrorStyle: {display: 'none'}
}

const initialState = {
  errorTracker: initialErrorStyle
}

export default handleActions({
  'SIGNUP_HANDLE_ERROR' (state, action) {
    return {
      ...state,
      errorTracker: action.payload
    }
  }
}, initialState)
