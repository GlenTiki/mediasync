import { createAction } from 'redux-actions'

export const signin = createAction('SIGNIN')
export const signout = createAction('SIGNOUT', function () {
  console.log('action')
  // cb()
})
export const signup = createAction('SIGNUP')
