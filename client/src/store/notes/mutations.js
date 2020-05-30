import Vue from "vue";

export const SOCKET_STATE = function(state, state_status) {
  if (state_status == "init") {
    state.notes = {};
    state.trees = {};
  }
};

export const newNote = function(state, newNote) {
  Vue.set(state.notes, newNote.id, newNote);
  if (
    !(newNote.id <= -1 || this.state.socket.treeNotes.indexOf(newNote.id) != -1)
  ) {
    // for (const tree of Object.keys(state.trees)) {
    //   const new_node = { note: newNote.id, children: [], parent: -1 };
    //   Vue.set(state.trees[tree], newNote.id, new_node);
    //   state.trees[tree][-1].children.push(new_node);
    // }
  }
  return newNote.id;
};

export const deleteNote = function(state, note) {
  if (!state.notes[note]) {
    console.log("note '%s' not found", note);
    return;
  }
  for (const tree of Object.values(state.trees)) {
    if (tree[note] === undefined) continue;
    parent = tree[tree[note].parent];
    parent.children.splice(parent.children.indexOf(tree[note]), 1);
    Vue.delete(tree, note);
  }
  Vue.delete(state.notes, note);
};

// export const newTree = function (state, title = '') {
//   console.log(title)
//   const children = []
//   const newTree = {}
//   let tmp_obj = {}
//   for (const note of Object.values(state.notes)) {
//     if (note.id <= -1) continue
//     if (state.flattenTrees[note.id]) continue
//     tmp_obj = { note: note.id, parent: -1, children: [] }
//     children.push(tmp_obj)
//     newTree[note.id] = tmp_obj
//   }
//   const id = newNote(state, { title: title })
//   tmp_obj = { note: -1, parent: id, children: children }
//   newTree[-1] = tmp_obj
//   tmp_obj = { note: id, parent: null, children: [tmp_obj] }
//   newTree[id] = tmp_obj
//   Vue.set(state.flattenTrees, id, newTree)
//   console.log(state.flattenTrees)
// }

export const newTree = function(state, { tree, noteId }) {
  const newTree = {};
  let tmp_obj = tree[noteId];
  const queue = [tmp_obj];
  while (queue.length) {
    tmp_obj = queue.pop();
    newTree[tmp_obj.note] = tmp_obj;
    let newChildren = [];
    for (let child of tmp_obj.children) {
      child = tree[child];
      newChildren.push(child);
      queue.push(child);
    }
    tmp_obj.children = newChildren;
  }

  // append all unrelated notes
  const children = [];
  console.log(this.state.socket.treeNotes);
  // for (const note of Object.values(state.notes)) {
  //   if (note.id <= -1) continue;
  //   if (this.state.socket.treeNotes.indexOf(note.id) != -1) continue;
  //   if (newTree[note.id]) continue;
  //   tmp_obj = { note: note.id, parent: -1, children: [] };
  //   children.push(tmp_obj);
  //   newTree[note.id] = tmp_obj;
  // }
  // tmp_obj = { note: -1, parent: noteId, children: children };
  // newTree[-1] = tmp_obj;
  // newTree[noteId].children.push(tmp_obj);
  Vue.set(state.trees, noteId, newTree);
  console.log(state.trees);
};

// export const createFlattenTrees = function (state) {
//   if (Object.keys(state.flattenTrees).length) return

//   const tmp = []
//   let tmp_obj = null
//   for (var tree of state.trees) {
//     const flattedTree = {}
//     tree.parent = null
//     tmp.push(tree)
//     while (tmp.length) {
//       tmp_obj = tmp.pop()
//       flattedTree[tmp_obj.note] = tmp_obj
//       if (tmp_obj.children) {
//         for (var child of tmp_obj.children) {
//           child.parent = tmp_obj.note
//           tmp.push(child)
//         }
//       }
//     }
//     if (!state.notes[-1]) {
//       newNote(
//         state,
//         { title: 'unrelated', content: '', tags: [], links: [], id: -1 }
//       )
//     }
//     const unrelated = { note: -1, children: [], parent: tree.note }
//     flattedTree[unrelated.note] = unrelated
//     flattedTree[tree.note].children.push(unrelated)
//     for (var note of Object.keys(state.notes)) {
//       note = parseInt(note)
//       if (flattedTree[note]) continue
//       if (note < 0) continue
//       tmp_obj = {
//         note: note,
//         children: [],
//         parent: unrelated.note
//       }
//       flattedTree[tmp_obj.note] = tmp_obj
//       unrelated.children.push(tmp_obj)
//     }
//     Vue.set(state.flattenTrees, tree.note, flattedTree)
//     Vue.set(state.notes, -2, {
//       id: -2,
//       title: 'This is example project',
//       content:
//         '#### Description\n Here you will write your description of the project',
//       tags: [],
//       links: []
//     })
//   }
// }

export const updateTreeNode = function(state, { tree, node }) {
  let children = [];
  tree = state.trees[tree];
  let treeNode = tree[node.note];
  if (treeNode === undefined) {
    treeNode = { note: node.note, parent: node.parent, children: [] };
    Vue.set(tree, node.note, treeNode);
  }
  // if (treeNode.parent == -1) {
  //   tree[-1].children.splice(tree[-1].children.indexOf(treeNode), 1);
  // }
  for (let child of node.children) {
    children.push(tree[child]);
  }
  // if (treeNode.children.indexOf(tree[-1]) != -1) {
  //   children.push(tree[-1]);
  // }
  Vue.set(treeNode, "children", children);
  Vue.set(treeNode, "parent", node.parent);
};

// export const deleteTreeNode = function (state, { tree, noteId }) {
//   tree = state.trees[tree]
//   console.log(tree)
//   console.log(tree[noteId])
//   let note = tree[noteId]
//   tree[note.parent].children.splice(tree[note.parent].children.indexOf(note), 1)
//   let unrelated = tree[-1]
//   let queue = [tree[noteId]]
//   while (queue.length) {
//     let tmp = queue.pop()
//     for (let child of tmp.children) {
//       queue.push(child)
//     }
//     Vue.set(tmp, 'parent', -1)
//     Vue.set(tmp, 'children', [])
//     unrelated.children.splice(0, 0, tmp)
//   }
//   console.log(tree)
// }
export const removeNodeFromTree = function(state, { treeId, noteId }) {
  let tree = state.trees[treeId];
  if (tree[noteId] === undefined) return;
  let node = tree[noteId];
  // if (tree[node.parent] !== undefined) {
  //   console.log(tree[node.parent].children.slice());
  //   console.log(tree[node.parent]);
  //   console.log(tree[node.parent].children.indexOf(node));
  //   tree[node.parent].children.splice(
  //     tree[node.parent].children.indexOf(node),
  //     1
  //   );
  // }
  Vue.delete(tree, node.note);
};

export const moveNote = function(
  state,
  { treeId, note, newParent, newIndex = 0 } = {}
) {
  if (!state.trees[treeId]) {
    console.log("tree '%s' not found", treeId);
    return;
  }
  let tree = state.trees[treeId];
  if (!tree[note]) {
    console.log("note '%s' not found", note);
    return;
  }
  if (!tree[newParent]) {
    console.log("newParent '%s' not found", newParent);
  }
  let tmpParent = newParent;
  while (tmpParent !== null) {
    if (tmpParent == note) {
      console.log("recursion detected!!");
      return;
    }
    tmpParent = tree[tmpParent].parent;
  }
  this._vm.$socket.emit("move note", {
    noteId: note,
    treeId: treeId,
    parentId: newParent,
    index: newIndex
  });
};

export const prepareTags = function(state) {
  if (state.tags) return;
  const tmp = new Set();
  for (const note of Object.values(state.notes)) {
    for (const tag of note.tags) {
      tmp.add(tag);
    }
  }
  state.tags = Array.from(tmp);
};
