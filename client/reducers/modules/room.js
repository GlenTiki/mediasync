import { handleActions } from 'redux-actions'

const initialState = {
  openPanel: 0
}

export default handleActions({
  'HANDLE_PANEL_CLICK' (state, action) {
    if (action.payload !== state.openPanel) {
      return {
        ...state,
        openPanel: action.payload
      }
    }

    return state
  }
}, initialState)
