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
  problemConnectingToServerErrorStyle: {display: 'none'},
  currPWMatchFormErrorStyle: {display: 'none'},
  successStyle: {display: 'none'}
}

const initialState = {
  errorTracker: initialErrorStyle,
  displayChangePasswordModal: false
}

export default handleActions({
  'HANDLE_SETTINGS_ERROR' (state, action) {
    return {
      ...state,
      errorTracker: action.payload
    }
  },

  'SHOW_CHANGE_PASSWORD_MODAL' (state, action) {
    return {
      ...state,
      displayChangePasswordModal: action.payload
    }
  }
}, initialState)
