import { createAction } from 'redux-actions'

export const handlePanelClick = createAction('HANDLE_PANEL_CLICK')
export const enterRoom = createAction('ENTER_ROOM')
export const leaveRoom = createAction('LEAVE_ROOM')
export const receivedRoomCredentials = createAction('RECEIVED_ROOM_CREDENTIALS')
export const playMedia = createAction('PLAY_MEDIA')
export const pauseMedia = createAction('PAUSE_MEDIA')
export const skipMedia = createAction('SKIP_MEDIA')
export const backMedia = createAction('BACK_MEDIA')
export const addToQueue = createAction('ADD_TO_QUEUE')
export const deleteFromQueue = createAction('DELETE_FROM_QUEUE')
export const moveInQueue = createAction('MOVE_IN_QUEUE')

// export const showPasswordModal = createAction('SHOW_CHANGE_PASSWORD_MODAL')
