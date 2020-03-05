export const updateNote = function (state, note) {
  if (state.notes.notes[note.id].id !== note.id) {
    console.log('Error state.notes.notes[note.id].id !== note.id');
    console.log(note);
    console.log(state.notes.notes[note.id]);
  }
  state.notes.notes[note.id].title = note.title;
  state.notes.notes[note.id].content = note.content;
  state.notes.notes[note.id].tags = note.tags;
  state.notes.notes[note.id].links = note.links;
}

export const newNote = function (state, title = '', content = '', tags = [], links = []) {
  var newNote = {
    id: Object.keys(state.notes.notes).length,
    title,
    content,
    tags,
    links
  };
  state.notes.notes.push(newNote);
}