export const updateNote = function (
  state,
  { note = null, title = null, content = null, tags = null, links = null } = {}
) {
  console.log(note)
  console.log(title)
  if (note === null || state.notes[note].id !== note) {
    console.log('Error state.notes[note.id].id !== note.id')
    console.log(note)
    console.log(state.notes[note])
  }
  state.notes[note].title = title === null ? state.notes[note].title : title
  state.notes[note].content =
    content === null ? state.notes[note].content : content
  state.notes[note].tags = tags === null ? state.notes[note].tags : tags
  state.notes[note].links = links === null ? state.notes[note].links : links
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
