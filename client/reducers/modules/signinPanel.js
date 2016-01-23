import { handleActions } from 'redux-actions'

const initialErrorStyle = {
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
  landingSelected: 1,
  navSelected: 1,
  landingErrorTracker: initialErrorStyle,
  navErrorTracker: initialErrorStyle
}

export default handleActions({
  'LANDING_HANDLE_SELECT' (state, action) {
    return {
      ...state,
      landingSelected: action.payload
    }
  },

  'NAV_HANDLE_SELECT' (state, action) {
    return {
      ...state,
      navSelected: action.payload
    }
  },

  'LANDING_HANDLE_ERROR' (state, action) {
    return {
      ...state,
      landingErrorTracker: action.payload
    }
  },

  'NAV_HANDLE_ERROR' (state, action) {
    return {
      ...state,
      navErrorTracker: action.payload
    }
  }
}, initialState)
