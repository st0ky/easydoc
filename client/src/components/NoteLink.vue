<template>
  <q-item
    :to="to"
    :target="target"
  > {{ title }} </q-item>
</template>

<script>

import { mapState } from 'vuex'

export default {
  name: 'NoteLink',
  props: {
    type: { type: String, default: 'error' },
    url: { type: String, default: '' },
    name: { type: String, default: '' },
    fileId: { type: Number, default: -1 },
    noteId: { type: Number, default: -1 },
    treeId: { type: Number, default: -1 },
    line: { type: Number, default: -1 },
    endLine: { type: Number, default: -1 },
    startCol: { type: Number, default: -1 },
    endCol: { type: Number, default: -1 },
  },
  components: {},
  data () {
    return {
      primary: true,
      internalName: ''
    };
  },
  computed: {
    ...mapState('notes', [
      'notes',
      'trees'
    ]),
    to () {
      let treeId = this.treeId >= 0 ? this.treeId : parseInt(this.$route.params.tree)
      treeId = isNaN(treeId) ? parseInt(Object.keys(this.trees)[0]) : treeId
      let noteId = this.noteId >= 0 ? this.noteId : parseInt(this.$route.params.note)
      noteId = isNaN(noteId) ? -1 : noteId
      let names = { file: noteId < 0 ? 'code' : "noteCode", note: 'noteView', extern: this.url }
      if (names[this.type] === undefined) return
      if (this.type == 'file' && this.fileId < 0) return
      if (this.type == 'note' && noteId < 0) return
      if (this.type == 'extern') return this.url
      return {
        name: names[this.type],
        params: {
          note: noteId,
          tree: treeId,
          fileId: this.fileId,
          line: this.line,
          endLine: this.endLine,
          startCol: this.startCol,
          endCol: this.endCol
        }
      }

    },
    target () {
      let types = { file: '', note: '', extern: '_blank' }
      if (types[this.type] === undefined) {
        return ''
      }
      return types[this.type]
    },
    title () {
      if (this.name) return this.name
      if (this.type == 'extern') return this.url.split("//").pop().slice(20)
      if (this.type == 'note') return this.notes[this.noteId].title
      if (this.type == 'file' && this.name == '') {
        this.$socket.emit("fs get file name", this.fileId)

      }
      if (this.internalName) return this.internalName
      return JSON.stringify({ type: this.type, fileId: this.fileId, noteId: this.noteId, treeId: this.treeId })
    }
  },
  methods: {
  },
  sockets: {
    FS_FILE_NAME: function ({ fileId, name }) {
      if (fileId == this.fileId) {
        this.$nextTick(() => {
          this.internalName = name + ":" + (this.line + 1)
        })
      }
    },
  },
  mounted () {
  },
  watch: {
  }
}
</script>
