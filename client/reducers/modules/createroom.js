import { handleActions } from 'redux-actions'

const initialErrorStyle = {
  nameEmptyErrorStyle: {display: 'none'},
  nameLengthErrorStyle: {display: 'none'}
}

const initialState = {
  errorTracker: initialErrorStyle,
  showPlaybackControllers: false,
  showInvitedUsers: false
}

export default handleActions({
  'HANDLE_CREATE_ROOM_ERROR' (state, action) {
    return {
      ...state,
      errorTracker: action.payload
    }
  },
  'HANDLE_PLAYBACK_CONTROLLERS_CHANGE' (state, action) {
    return {
      ...state,
      showPlaybackControllers: action.payload
    }
  },
  'HANDLE_ROOM_TYPE_CHANGE' (state, action) {
    return {
      ...state,
      showInvitedUsers: action.payload
    }
  }
}, initialState)
