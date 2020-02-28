export const updateNote = function (state, note) {
  if (state.notes[note.id].id !== note.id) {
    console.log('Error state.notes[note.id].id !== note.id');
    console.log(note);
    console.log(state.notes[note.id]);
  }
  state.notes[note.id].title = note.title;
  state.notes[note.id].content = note.content;
  state.notes[note.id].tags = note.tags;
  state.notes[note.id].links = note.links;
}

export const newNote = function (state, title = '', content = '', tags = [], links = []) {
  var newNote = {
    id: Object.keys(state.notes).length,
    title,
    content,
    tags,
    links
  };
  state.notes.push(newNote);
}