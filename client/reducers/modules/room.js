import { handleActions } from 'redux-actions'

const initialState = {
  display: {
    openPanel: 0
  }
}

export default handleActions({
  'HANDLE_PANEL_CLICK' (state, action) {
    if (action.payload !== state.openPanel) {
      return {
        ...state,
        display: {
          openPanel: action.payload
        }
      }
    }

    return state
  },

  'LEAVE_ROOM' (state, action) {
    return initialState
  },

  'RECEIVED_ROOM_CREDENTIALS' (state, action) {
    return {
      ...state,
      connectedCredentials: action.payload
    }
  }
}, initialState)
