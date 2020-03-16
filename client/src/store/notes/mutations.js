export const updateNote = function (
  state,
  { note = null, title = null, content = null, tags = null, links = null } = {}
) {
  if (note === null || state.notes[note].id !== note) {
    console.log('Error state.notes[note.id].id !== note.id')
    console.log(note)
    console.log(state.notes[note])
  }
  title === null ? '' : (state.notes[note].title = title)
  content === null ? '' : (state.notes[note].content = content)
  tags === null ? '' : (state.notes[note].tags = tags)
  links === null ? '' : (state.notes[note].links = links)
}

export const newNote = function (
  state,
  title = '',
  content = '',
  tags = [],
  links = []
) {
  var newNote = {
    id: Object.keys(state.notes).length,
    title,
    content,
    tags,
    links
  }
  state.notes.push(newNote)
}

export const setFocuse = function (state, noteid) {
  state.notes.focus = _.has(state.notes, noteid) ? noteid : false
}

export const createFlattenTrees = function (state) {
  if (state.flattenTrees) return

  state.flattenTrees = {}
  const tmp = []
  let tmp_obj = null
  for (var tree of state.trees) {
    const obj = {}
    state.flattenTrees[tree.note] = obj
    tree.parent = null
    tmp.push(tree)
    while (tmp.length) {
      tmp_obj = tmp.pop()
      obj[tmp_obj.note] = tmp_obj
      if (tmp_obj.children) {
        for (var child of tmp_obj.children) {
          child.parent = tmp_obj.note
          tmp.push(child)
        }
      }
    }
  }
}

export const moveNote = function (
  state,
  { tree, note, newParent, newIndex = 0 } = {}
) {
  if (!state.flattenTrees) {
    createFlattenTrees(state)
  }
  tree = state.flattenTrees[tree]
  if (!tree[note]) {
    console.log("note '%s' not found", note)
    return
  }
  if (!tree[newParent]) {
    console.log("newParent '%s' not found", newParent)
  }
  let tmpParent = newParent
  while (tmpParent !== null) {
    if (tmpParent == note) {
      console.log('recursion detected!!')
      return
    }
    tmpParent = tree[tmpParent].parent
  }
  const oldParent = tree[tree[note].parent]
  oldParent.children.splice(oldParent.children.indexOf(tree[note]), 1)
  tree[note].parent = newParent
  tree[newParent].children.splice(newIndex, 0, tree[note])
}
