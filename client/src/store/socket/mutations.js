import Vue from "vue";
import { Cookies } from "quasar";

export function SOCKET_CONNECTION(state, user_id) {
  console.log("SOCKET_CONNECTION", user_id);
  if (state.user !== null) {
    Vue.prototype.$socket.emit("login", state.user);
  }
}

export function SOCKET_STATE(state, localState) {
  console.log("SOCKET_STATE", localState);
  Vue.set(state, "localState", localState);
}

export function SOCKET_NEW_NOTES(state, notes) {
  console.log("SOCKET_NEW_NOTES", notes);
  for (let note of Object.values(notes)) {
    this.commit("notes/newNote", note);
  }
}

export function SOCKET_NEW_NOTE(state, note) {
  console.log("SOCKET_NEW_NOTE", note);
  this.commit("notes/newNote", note);
}

export function SOCKET_DELETE_NOTE(state, note) {
  console.log("SOCKET_DELETE_NOTE", note);
  this.commit("notes/deleteNote", note);
}

export function SOCKET_UPDATE_NOTE(state, note) {
  console.log("SOCKET_UPDATE_NOTE", note);
  Vue.set(this.state.notes.notes, note.id, note);
}

export function SOCKET_UPDATE_TREE_NODE(state, params) {
  console.log("SOCKET_UPDATE_TREE_NODE", params);
  this.commit("notes/updateTreeNode", params);
}

export function SOCKET_UPDATE_TREE_NODES(state, { tree, nodes }) {
  console.log("SOCKET_UPDATE_TREE_NODES", [tree, nodes]);
  for (let node of nodes)
    this.commit("notes/updateTreeNode", { tree: tree, node: node });
}

export function SOCKET_REMOVE_NODES_FROM_TREE(state, { tree, omit }) {
  console.log("SOCKET_REMOVE_NODES_FROM_TREE", tree, omit);
  for (let node of omit) {
    this.commit("notes/removeNodeFromTree", {
      treeId: tree,
      noteId: parseInt(node)
    });
  }
}

export function SOCKET_UPDATE_TREE_NOTES(state, notes) {
  console.log("SOCKET_UPDATE_TREE_NOTES", notes);
  Vue.set(state, "treeNotes", notes);
}

export function SOCKET_UPDATE_TAGS(state, tags) {
  console.log("SOCKET_UPDATE_TAGS", tags);
  Vue.set(state, "tags", tags);
}

export function SOCKET_NEW_TREES(state, trees) {
  console.log("SOCKET_NEW_TREES", trees);
  for (let [noteId, tree] of Object.entries(trees)) {
    this.commit("notes/newTree", { tree: tree, noteId: parseInt(noteId) });
  }
}

export function SOCKET_NEW_TREE(state, params) {
  console.log("SOCKET_NEW_TREE", params);
  this.commit("notes/newTree", params);
}

export function SOCKET_NEW_FILETREES(state, fileTrees) {
  console.log("SOCKET_NEW_FILETREES", fileTrees);
  Vue.set(state, "fileTrees", fileTrees);
}

export function SOCKET_NEW_FILETREE(state, { noteId, tree }) {
  console.log("SOCKET_NEW_FILETREE", noteId, tree);
  Vue.set(state.fileTrees, noteId, tree);
}

export function SOCKET_UPDATE_USERS(state, users) {
  console.log("UPDATE_USERS", users);
}

export function SOCKET_LOGIN_UPDATE(state, { status, user }) {
  console.log("LOGIN_UPDATE", status, user);
  state.loginStatus = status;
  state.user = user;
  Cookies.set("user", user);
}
