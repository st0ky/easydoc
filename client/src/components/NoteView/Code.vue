<template>
  <div class="q-pa-md">
    <q-card
      flat
      bordered
    >
      <vue-ace-editor
        :content="content"
        :fontSize="14"
        height="300px"
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
    fileId: Number,
    rangeStart: Number,
    rangeEnd: Number
  },
  components: { VueAceEditor },
  data () {
    return {
      content: `
# importing Magics module
from Magics.macro import *
# Setting of the output file name
output = output(output_formats=['png'],
                output_name_first_page_number='off',
                output_name='odb_step2')
      `
    };
  },
  computed: {
    _note () {
      if (this.$store.state.notes.flattenTrees[this.tree] === undefined) {
        return null
      }
      return this.note
    }
  },
  methods: {
    editorInit () {
      require('brace/ext/language_tools');
      require('brace/mode/python');
      require('brace/snippets/python');
      require('brace/theme/eclipse');
    },
    editorChange (editor) {
      console.log("changed", editor.getValue());
    },
    editorInput (editor) {
      console.log("input", editor.getValue());
    },
    editorFocus (editor) {
      console.log("focus", editor);
    },
    editorBlur (editor) {
      console.log("blur", editor);
    },
    editorPaste (editor) {
      console.log("pase", editor);
    }
  },
  watch: {
    $route (to, from) {
      this.fileId = this.fileId
      this.rangeStart = this.rangeStart
      this.rangeEnd = this.rangeEnd
    }
  }
}
</script>
