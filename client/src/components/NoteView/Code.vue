<template>
  <q-card
    flat
    bordered
    :class="$q.dark.isActive ? 'elev-08dp' : 'bg-grey-3'"
    class="col-12 column"
  >
    <q-list dir="ltr" class="row col-auto">
      <q-item>{{ path }}</q-item>
      <q-space />
      <q-btn
        :color="$q.dark.isActive ? 'elev-2dp' : 'grey-7'"
        round
        flat
        icon="trip_origin"
        @click="goToPoint"
      >
        <q-tooltip>remark point</q-tooltip>
      </q-btn>
      <q-btn
        :color="$q.dark.isActive ? 'elev-2dp' : 'grey-7'"
        round
        flat
        icon="note_add"
        @click="addNote"
      >
        <q-tooltip>note on point</q-tooltip>
      </q-btn>
      <q-btn
        :color="$q.dark.isActive ? 'elev-2dp' : 'grey-7'"
        round
        flat
        icon="las la-thumbtack"
        :disable="$route.params.note === undefined"
        @click="pin"
      >
        <q-tooltip>link to point</q-tooltip>
      </q-btn>
    </q-list>
    <div class="col row  items-stretch">
      <q-card bordered class="col-12">
        <ace-editor
          style="min-height: 500px"
          ref="editor"
          name="editor"
          :value="content"
          :fontSize="14"
          :readOnly="true"
          :editorProps="{ $blockScrolling: Infinity }"
          :onLoad="onLoad"
          width="100%"
          height="100%"
          mode="python"
          theme="monokai"
        />
      </q-card>
    </div>
  </q-card>
</template>

<script>
import brace from "brace";
import { Ace as AceEditor, Split as SplitEditor } from "vue2-brace-editor";

// import ace from "brace";
// import "brace/ext/language_tools";
import "brace/mode/python";
// import "brace/snippets/python";
// import "brace/theme/eclipse";
import "brace/theme/monokai";

// import {
//   VueAceEditor,
//   VueSplitEditor,
//   VueStaticHighlight
// } from "vue2x-ace-editor";

import { mapState } from "vuex";

export default {
  name: "Code",
  props: {
    fileId: { type: Number, default: -1 },
    line: { type: Number, default: -1 },
    endLine: { type: Number, default: -1 },
    startCol: { type: Number, default: -1 },
    endCol: { type: Number, default: -1 },
    height: { type: String, default: "300px" }
  },
  components: { AceEditor },
  data() {
    return {
      content: "",
      saved_state: {
        fileId: -1,
        line: -1,
        endLine: -1,
        startCol: -1,
        endCol: -1
      },
      editor: null,
      path: ""
    };
  },
  computed: {
    ...mapState("notes", ["notes", "trees"])
  },
  methods: {
    editorInit() {
      require("brace/ext/language_tools");
      require("brace/mode/python");
      require("brace/snippets/python");
      require("brace/theme/eclipse");
    },
    editorChange(editor) {
      //   console.log("changed", editor.getValue());
    },
    editorInput(editor) {
      //   console.log("input", editor.getValue());
    },
    editorFocus(editor) {
      //   console.log("focus", editor);
    },
    editorBlur(editor) {
      //   console.log("blur", editor);
    },
    editorPaste(editor) {
      //   console.log("pase", editor);
    },
    onLoad(editor) {
      this.editor = editor;
      this.update();
    },
    goToPoint() {
      let { line, endLine, startCol, endCol } = this.saved_state;
      if (line >= 0 && line < this.editor.session.getLength()) {
        this.editor.gotoLine(
          line,
          !isNaN(startCol) && startCol >= 0 ? startCol : 0
        );
        if (!isNaN(endLine) && endLine >= 0) {
          this.editor.selection.setSelectionRange({
            start: {
              row: line,
              column: !isNaN(startCol) && startCol >= 0 ? startCol : 0
            },
            end: {
              row: endLine,
              column: !isNaN(endCol) && endCol >= 0 ? endCol : 0
            }
          });
        }
      }
    },
    update() {
      if (this.fileId != this.saved_state.fileId) {
        this.content = "";
        this.$socket.emit("fs get file content", this.fileId);
      }
      if (
        this.line != this.saved_state.line ||
        this.endLine != this.saved_state.endLine ||
        this.startCol != this.saved_state.startCol ||
        this.endCol != this.saved_state.line
      ) {
        this.saved_state.line = this.line;
        this.saved_state.endLine = this.endLine;
        this.saved_state.startCol = this.startCol;
        this.saved_state.endCol = this.endCol;
        this.goToPoint();
      }
    },
    pin() {
      let note = this.notes[parseInt(this.$route.params.note)];
      let links = note.links.concat([
        { type: "file", fileId: this.fileId, ...this.getPos() }
      ]);
      this.$socket.emit("update note", { id: note.id, links: links });
    },
    getPos() {
      let { start, end } = this.editor.selection.isEmpty()
        ? { start: { row: -1, column: -1 }, end: { row: -1, column: -1 } }
        : this.editor.selection.getRange();
      if (start.row == -1) start = this.editor.getCursorPosition();
      return {
        line: start.row,
        startCol: start.column,
        endLine: end.row,
        endCol: end.column
      };
    },
    addNote() {
      let tree =
        this.$route.params.tree !== undefined
          ? this.$route.params.tree
          : Object.keys(this.trees)[0];
      let pos = this.getPos();
      this.sockets.subscribe("new note ack", noteId => {
        if (this.$route.params.note !== undefined) {
          this.$socket.emit("move note", {
            noteId: noteId,
            treeId: parseInt(tree),
            parentId: parseInt(this.$route.params.note)
          });
        }
        this.$router.push({
          name: "noteCode",
          params: { tree: tree, note: noteId, fileId: this.fileId, ...pos }
        });
        this.sockets.unsubscribe("new note ack");
      });
      this.$socket.emit("new note", {
        title: `note on: ${this.path.split("/").pop()}:${pos.line + 1}`,
        links: [{ type: "file", fileId: this.fileId, ...pos }]
      });
    }
  },
  watch: {
    $route(to, from) {
      this.fileId = this.fileId;
      this.line = this.line;
      this.endLine = this.endLine;
      this.startCol = this.startCol;
      this.endCol = this.endCol;
      this.update();
    }
  },
  sockets: {
    FS_FILE_CONTENT: function({ fileId, content, path }) {
      this.saved_state.fileId = fileId;
      this.content = content;
      this.$nextTick(() => {
        this.goToPoint();
        this.path = path;
      });
    },
    CONNECTION: function() {
      if (this.fileId != -1) {
        this.$socket.emit("fs get file content", this.fileId);
      }
    }
  }
  // mounted() {
  //   this.$nextTick(() => {
  //     this.editor = this.$refs.editor.editor;
  //     this.update();
  //   });
  // }
  //   beforeRouteUpdate (to, from, next) {
  //     console.log('getScrollTop', this.editor.getSession().getScrollTop())
  //     next()
  //   }
};
</script>
