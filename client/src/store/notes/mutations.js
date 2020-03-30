import Vue from 'vue'

export const updateNote = function (
  state,
  { note, title = null, content = null, tags = null, links = null } = {}
) {
  if (note === null || state.notes[note].id !== note) {
    console.log('Error state.notes[note.id].id !== note.id')
    console.log(note)
    console.log(state.notes[note])
  }
  title === null ? '' : (state.notes[note].title = title)
  content === null ? '' : (state.notes[note].content = content)
  if (tags) {
    const tmp = new Set(state.tags)
    for (const tag of tags) {
      tmp.add(tag)
    }
    state.tags = Array.from(tmp)
  }
  tags === null ? '' : (state.notes[note].tags = tags)
  links === null ? '' : (state.notes[note].links = links)
}

export const removeTag = function (state, { note, tag } = {}) {
  if (note === null || state.notes[note].id !== note) {
    console.log('Error state.notes[note.id].id !== note.id')
    console.log(note)
    console.log(state.notes[note])
    return
  }
  if (state.notes[note].tags.indexOf(tag) == -1) {
    console.log('can not find this "%s" tag', tag)
    return
  }
  state.notes[note].tags.splice(state.notes[note].tags.indexOf(tag), 1)
}

export const removeLink = function (state, { note, link } = {}) {
  if (note === null || state.notes[note].id !== note) {
    console.log('Error state.notes[note.id].id !== note.id')
    console.log(note)
    console.log(state.notes[note])
    return
  }
  if (state.notes[note].links.indexOf(link) == -1) {
    console.log('can not find this "%s" link', link)
    return
  }
  state.notes[note].links.splice(state.notes[note].links.indexOf(link), 1)
}

export const newNote = function (
  state,
  {
    title = '',
    content = '',
    tags = [],
    links = [],
    tree = null,
    parent = null
  } = {},
  id = null
) {
  var newNote = {
    id: id == null ? Math.max(...Object.keys(state.notes)) + 1 : id,
    title,
    content,
    tags,
    links
  }
  Vue.set(state.notes, newNote.id, newNote)
  if (id != null) return
  createFlattenTrees(state)
  for (const tree of Object.keys(state.flattenTrees)) {
    const new_node = { note: newNote.id, children: [], parent: -1 }
    Vue.set(state.flattenTrees[tree], newNote.id, new_node)
    const unrelated = state.flattenTrees[tree][-1]
    unrelated.children.push(new_node)
  }
  if (id == null && tree != null && parent != null) {
    moveNote(state, { tree: tree, note: newNote.id, newParent: parent })
  }
  state.lastCreatedNote = newNote.id
  return newNote.id
}

export const deleteNote = function (state, note) {
  if (!state.notes[note]) {
    console.log("note '%s' not found", note)
    return
  }
  if (note <= -1) {
    console.log('special can not be deleted')
    return
  }
  createFlattenTrees(state)
  if (state.flattenTrees[note]) {
    console.log("note '%s' is a tree", note)
    return
  }
  for (const tree of Object.values(state.flattenTrees)) {
    parent = tree[tree[note].parent]
    parent.children.splice(parent.children.indexOf(tree[note]), 1)
    for (const child of tree[note].children) {
      moveNote(state, { tree: null, note: child.note, newParent: -1 }, tree)
    }
  }
  Vue.delete(state.notes, note)
}

export const newTree = function (state, title = '') {
  console.log(title)
  const children = []
  const newTree = {}
  let tmp_obj = {}
  for (const note of Object.values(state.notes)) {
    if (note.id <= -1) continue
    if (state.flattenTrees[note.id]) continue
    tmp_obj = { note: note.id, parent: -1, children: [] }
    children.push(tmp_obj)
    newTree[note.id] = tmp_obj
  }
  const id = newNote(state, { title: title })
  tmp_obj = { note: -1, parent: id, children: children }
  newTree[-1] = tmp_obj
  tmp_obj = { note: id, parent: null, children: [tmp_obj] }
  newTree[id] = tmp_obj
  Vue.set(state.flattenTrees, id, newTree)
  console.log(state.flattenTrees)
}

export const setFocuse = function (state, noteid) {
  state.notes.focus = _.has(state.notes, noteid) ? noteid : false
}

export const createFlattenTrees = function (state) {
  if (Object.keys(state.flattenTrees).length) return

  const tmp = []
  let tmp_obj = null
  for (var tree of state.trees) {
    const flattedTree = {}
    tree.parent = null
    tmp.push(tree)
    while (tmp.length) {
      tmp_obj = tmp.pop()
      flattedTree[tmp_obj.note] = tmp_obj
      if (tmp_obj.children) {
        for (var child of tmp_obj.children) {
          child.parent = tmp_obj.note
          tmp.push(child)
        }
      }
    }
    if (!state.notes[-1]) {
      newNote(
        state,
        { title: 'unrelated', content: '', tags: [], links: [] },
        -1
      )
    }
    const unrelated = { note: -1, children: [], parent: tree.note }
    flattedTree[unrelated.note] = unrelated
    flattedTree[tree.note].children.push(unrelated)
    for (var note of Object.keys(state.notes)) {
      note = parseInt(note)
      if (flattedTree[note]) continue
      if (note < 0) continue
      tmp_obj = {
        note: note,
        children: [],
        parent: unrelated.note
      }
      flattedTree[tmp_obj.note] = tmp_obj
      unrelated.children.push(tmp_obj)
    }
    Vue.set(state.flattenTrees, tree.note, flattedTree)
    Vue.set(state.notes, -2, {
      id: -2,
      title: 'This is example project',
      content:
        '#### Description\n Here you will write your description of the project',
      tags: [],
      links: []
    })
  }
}

export const moveNote = function (
  state,
  { tree, note, newParent, newIndex = 0 } = {},
  flattedTree = null
) {
  if (!state.flattenTrees) {
    createFlattenTrees(state)
  }
  if (flattedTree) {
    tree = flattedTree
  } else {
    if (!state.flattenTrees[tree]) {
      console.log("tree '%s' not found", tree)
      return
    }
    tree = state.flattenTrees[tree]
  }
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

export const prepareTags = function (state) {
  if (state.tags) return
  const tmp = new Set()
  for (const note of Object.values(state.notes)) {
    for (const tag of note.tags) {
      tmp.add(tag)
    }
  }
  state.tags = Array.from(tmp)
}
