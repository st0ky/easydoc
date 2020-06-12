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
    <div class="col row items-stretch">
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
          :mode="mode"
          theme="monokai"
        />
      </q-card>
    </div>
  </q-card>
</template>

<script>
import brace from "brace";
var modelist = brace.acequire("ace/ext/modelist");
import getModeForPath from "brace/ext/modelist";
import { Ace as AceEditor, Split as SplitEditor } from "vue2-brace-editor";

import "brace/mode/abap.js";
import "brace/mode/abc.js";
import "brace/mode/actionscript.js";
import "brace/mode/ada.js";
import "brace/mode/apache_conf.js";
import "brace/mode/applescript.js";
import "brace/mode/asciidoc.js";
import "brace/mode/assembly_x86.js";
import "brace/mode/autohotkey.js";
import "brace/mode/batchfile.js";
import "brace/mode/bro.js";
import "brace/mode/c9search.js";
import "brace/mode/c_cpp.js";
import "brace/mode/cirru.js";
import "brace/mode/clojure.js";
import "brace/mode/cobol.js";
import "brace/mode/coffee.js";
import "brace/mode/coldfusion.js";
import "brace/mode/csharp.js";
import "brace/mode/csound_document.js";
import "brace/mode/csound_orchestra.js";
import "brace/mode/csound_score.js";
import "brace/mode/css.js";
import "brace/mode/curly.js";
import "brace/mode/d.js";
import "brace/mode/dart.js";
import "brace/mode/diff.js";
import "brace/mode/django.js";
import "brace/mode/dockerfile.js";
import "brace/mode/dot.js";
import "brace/mode/drools.js";
import "brace/mode/eiffel.js";
import "brace/mode/ejs.js";
import "brace/mode/elixir.js";
import "brace/mode/elm.js";
import "brace/mode/erlang.js";
import "brace/mode/forth.js";
import "brace/mode/fortran.js";
import "brace/mode/ftl.js";
import "brace/mode/gcode.js";
import "brace/mode/gherkin.js";
import "brace/mode/gitignore.js";
import "brace/mode/glsl.js";
import "brace/mode/gobstones.js";
import "brace/mode/golang.js";
import "brace/mode/graphqlschema.js";
import "brace/mode/groovy.js";
import "brace/mode/haml.js";
import "brace/mode/handlebars.js";
import "brace/mode/haskell.js";
import "brace/mode/haskell_cabal.js";
import "brace/mode/haxe.js";
import "brace/mode/hjson.js";
import "brace/mode/html.js";
import "brace/mode/html_elixir.js";
import "brace/mode/html_ruby.js";
import "brace/mode/ini.js";
import "brace/mode/io.js";
import "brace/mode/jack.js";
import "brace/mode/jade.js";
import "brace/mode/java.js";
import "brace/mode/javascript.js";
import "brace/mode/json.js";
import "brace/mode/jsoniq.js";
import "brace/mode/jsp.js";
import "brace/mode/jssm.js";
import "brace/mode/jsx.js";
import "brace/mode/julia.js";
import "brace/mode/kotlin.js";
import "brace/mode/latex.js";
import "brace/mode/lean.js";
import "brace/mode/less.js";
import "brace/mode/liquid.js";
import "brace/mode/lisp.js";
import "brace/mode/live_script.js";
import "brace/mode/livescript.js";
import "brace/mode/logiql.js";
import "brace/mode/lsl.js";
import "brace/mode/lua.js";
import "brace/mode/luapage.js";
import "brace/mode/lucene.js";
import "brace/mode/makefile.js";
import "brace/mode/markdown.js";
import "brace/mode/mask.js";
import "brace/mode/matlab.js";
import "brace/mode/mavens_mate_log.js";
import "brace/mode/maze.js";
import "brace/mode/mel.js";
import "brace/mode/mips_assembler.js";
import "brace/mode/mipsassembler.js";
import "brace/mode/mushcode.js";
import "brace/mode/mysql.js";
import "brace/mode/nix.js";
import "brace/mode/nsis.js";
import "brace/mode/objectivec.js";
import "brace/mode/ocaml.js";
import "brace/mode/pascal.js";
import "brace/mode/perl.js";
import "brace/mode/pgsql.js";
import "brace/mode/php.js";
import "brace/mode/pig.js";
import "brace/mode/plain_text.js";
import "brace/mode/powershell.js";
import "brace/mode/praat.js";
import "brace/mode/prolog.js";
import "brace/mode/properties.js";
import "brace/mode/protobuf.js";
import "brace/mode/python.js";
import "brace/mode/r.js";
import "brace/mode/razor.js";
import "brace/mode/rdoc.js";
import "brace/mode/red.js";
import "brace/mode/rhtml.js";
import "brace/mode/rst.js";
import "brace/mode/ruby.js";
import "brace/mode/rust.js";
import "brace/mode/sass.js";
import "brace/mode/scad.js";
import "brace/mode/scala.js";
import "brace/mode/scheme.js";
import "brace/mode/scss.js";
import "brace/mode/sh.js";
import "brace/mode/sjs.js";
import "brace/mode/smarty.js";
import "brace/mode/snippets.js";
import "brace/mode/soy_template.js";
import "brace/mode/space.js";
import "brace/mode/sparql.js";
import "brace/mode/sql.js";
import "brace/mode/sqlserver.js";
import "brace/mode/stylus.js";
import "brace/mode/svg.js";
import "brace/mode/swift.js";
import "brace/mode/swig.js";
import "brace/mode/tcl.js";
import "brace/mode/tex.js";
import "brace/mode/text.js";
import "brace/mode/textile.js";
import "brace/mode/toml.js";
import "brace/mode/tsx.js";
import "brace/mode/turtle.js";
import "brace/mode/twig.js";
import "brace/mode/typescript.js";
import "brace/mode/vala.js";
import "brace/mode/vbscript.js";
import "brace/mode/velocity.js";
import "brace/mode/verilog.js";
import "brace/mode/vhdl.js";
import "brace/mode/wollok.js";
import "brace/mode/xml.js";
import "brace/mode/xquery.js";
import "brace/mode/yaml.js";

import "brace/theme/monokai";

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
    ...mapState("notes", ["notes", "trees"]),
    mode() {
      return modelist.getModeForPath(this.path).name;
    }
  },
  methods: {
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
