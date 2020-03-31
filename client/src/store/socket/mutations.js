/*
export function someMutation (state) {
}
*/

export function SOCKET_CONNECTION (state, user_id) {
  console.log('connection', user_id)
}

export function SOCKET_UPDATE_USERS (state, users) {
  console.log('UPDATE_USERS', users)
}
