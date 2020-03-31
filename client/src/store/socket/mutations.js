/*
export function someMutation (state) {
}
*/

export function SOCKET_CONNECTION (state, user_id) {
    console.log('SOCKET_CONNECTION', user_id)
}

export function SOCKET_STATE (state, localState) {
    console.log('SOCKET_STATE', localState)
    state.localState = localState
}

export function SOCKET_NEW_NOTES (state, notes) {
    console.log('SOCKET_NEW_NOTES', notes)
    for (let note of Object.values(notes)) {
        this.commit("notes/newNote", note)
    }
}

export function SOCKET_UPDATE_TREE_NOTES (state, notes) {
    console.log('SOCKET_UPDATE_TREE_NOTES', notes)
    state.treeNotes = notes
}

export function SOCKET_NEW_TREES (state, trees) {
    console.log('SOCKET_NEW_TREES', trees)
    for (let tree of Object.values(trees)) {
        this.commit("notes/newTree", tree)
    }
}

export function SOCKET_NEW_FILETREES (state, fileTrees) {
    console.log('SOCKET_NEW_FILETREES', fileTrees)
    for (let fileTree of Object.values(fileTrees)) {
        this.commit("notes/newFileTree", fileTree)
    }
}

export function SOCKET_UPDATE_USERS (state, users) {
    console.log('UPDATE_USERS', users)
}
