import Vue from 'vue'

export function SOCKET_CONNECTION (state, user_id) {
    console.log('SOCKET_CONNECTION', user_id)
}

export function SOCKET_STATE (state, localState) {
    console.log('SOCKET_STATE', localState)
    Vue.set(state, 'localState', localState)
}

export function SOCKET_NEW_NOTES (state, notes) {
    console.log('SOCKET_NEW_NOTES', notes)
    for (let note of Object.values(notes)) {
        this.commit("notes/newNote", note)
    }
}

export function SOCKET_NEW_NOTE (state, note) {
    console.log('SOCKET_NEW_NOTE', note)
    this.commit("notes/newNote", note)
}

export function SOCKET_DELETE_NOTE (state, note) {
    console.log('SOCKET_DELETE_NOTE', note)
    this.commit("notes/deleteNote", note)
}

export function SOCKET_UPDATE_NOTE (state, note) {
    console.log('SOCKET_UPDATE_NOTE', note)
    Vue.set(this.state.notes.notes, note.id, note)
}

export function SOCKET_UPDATE_TREE_NODE (state, params) {
    console.log('SOCKET_UPDATE_TREE_NODE', params)
    this.commit("notes/updateTreeNode", params)
}

export function SOCKET_DELETE_TREE_NODE (state, params) {
    console.log('SOCKET_UPDATE_TREE_NODE', params)
    this.commit("notes/deleteTreeNode", params)

}

export function SOCKET_UPDATE_TREE_NOTES (state, notes) {
    console.log('SOCKET_UPDATE_TREE_NOTES', notes)
    Vue.set(state, 'treeNotes', notes)
}

export function SOCKET_UPDATE_TAGS (state, tags) {
    console.log('SOCKET_UPDATE_TAGS', tags)
    Vue.set(state, 'tags', tags)
}

export function SOCKET_NEW_TREES (state, trees) {
    console.log('SOCKET_NEW_TREES', trees)
    for (let [noteId, tree] of Object.entries(trees)) {
        this.commit("notes/newTree", { tree: tree, noteId: noteId })
    }
}

export function SOCKET_NEW_TREE (state, params) {
    console.log('SOCKET_NEW_TREE', params)
    this.commit("notes/newTree", params)
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
