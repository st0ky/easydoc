<template>
  <div class="q-pa-md">
    <q-card
      flat
      bordered
    >
      <q-item> {{ path }} </q-item>
      <vue-ace-editor
        ref="editor"
        :content="content"
        :fontSize="14"
        height="300px"
        :readonly="true"
        lang="python"
        theme="monokai"
        @init="editorInit"
        @onChange="editorChange"
        @onInput="editorInput"
        @onFocus="editorFocus"
        @onBlur="editorBlur"
        @onPaste="editorPaste"
      />
    </q-card>
  </div>
</template>

<script>
import ace from 'brace'
import "brace/ext/language_tools";
import "brace/mode/python"
import "brace/snippets/python"
import "brace/theme/eclipse"
import "brace/theme/monokai"

import { VueAceEditor, VueSplitEditor, VueStaticHighlight } from 'vue2x-ace-editor'

export default {
  name: 'Code',
  props: {
    fileId: { type: Number, default: -1 },
    line: { type: Number, default: -1 },
    lineEnd: { type: Number, default: -1 },
    startCol: { type: Number, default: -1 },
    endCol: { type: Number, default: -1 },
  },
  components: { VueAceEditor },
  data () {
    return {
      content: '',
      saved_state: {
        fileId: -1,
        line: -1,
        lineEnd: -1,
        startCol: -1,
        endCol: -1,
      },
      editor: null,
      path: ''
    };
  },
  computed: {

  },
  methods: {
    editorInit () {
      require('brace/ext/language_tools');
      require('brace/mode/python');
      require('brace/snippets/python');
      require('brace/theme/eclipse');
    },
    editorChange (editor) {
      //   console.log("changed", editor.getValue());
    },
    editorInput (editor) {
      //   console.log("input", editor.getValue());
    },
    editorFocus (editor) {
      //   console.log("focus", editor);
    },
    editorBlur (editor) {
      //   console.log("blur", editor);
    },
    editorPaste (editor) {
      //   console.log("pase", editor);
    },
    update () {
      if (this.fileId != this.saved_state.fileId) {
        this.content = ''
        this.$socket.emit("fs get file content", this.fileId)
      }
      if (this.line != this.saved_state.line) {
        console.log("Code update line: %d", this.line)
        this.saved_state.line = this.line
        if (this.saved_state.line >= 0 && this.saved_state.line < this.editor.session.getLength()) {
          this.editor.gotoLine(this.saved_state.line)
        }
      }
    }

  },
  watch: {
    $route (to, from) {
      this.fileId = this.fileId
      this.line = this.line
      this.lineEnd = this.lineEnd
      this.startCol = this.startCol
      this.endCol = this.endCol
      this.update()
    }
  },
  sockets: {
    FS_FILE_CONTENT: function ({ fileId, content, path }) {
      this.saved_state.fileId = fileId
      this.content = content
      this.$nextTick(() => {
        if (this.saved_state.line >= 0 && this.saved_state.line < this.editor.session.getLength()) {
          this.editor.gotoLine(this.saved_state.line)
        }
        this.path = path
      })
    },
    CONNECTION: function () {
      if (this.saved_state.fileId != -1) {
        this.$socket.emit("fs get file content", this.fileId)
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.editor = this.$refs.editor.editor
      this.update()
    })
  }
  //   beforeRouteUpdate (to, from, next) {
  //     console.log('getScrollTop', this.editor.getSession().getScrollTop())
  //     next()
  //   }
}
</script>
