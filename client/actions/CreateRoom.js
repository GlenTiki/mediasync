import { createAction } from 'redux-actions'

export const handleError = createAction('HANDLE_CREATE_ROOM_ERROR')
export const handlePlaybackChange = createAction('HANDLE_PLAYBACK_CONTROLLERS_CHANGE')
export const handleTypeChange = createAction('HANDLE_ROOM_TYPE_CHANGE')

// export const showPasswordModal = createAction('SHOW_CHANGE_PASSWORD_MODAL')
