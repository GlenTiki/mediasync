import { createAction } from 'redux-actions'

export const increment = createAction('COUNTER_INCREMENT', (value = 1) => value)
export const decrement = createAction('COUNTER_DECREMENT', (value = 1) => value)
