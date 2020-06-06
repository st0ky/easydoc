<template>
  <div class="column">
    <div class="col-auto row q-gutter-xs">
      <q-input ref="filter" filled dense v-model="filter" label="Filter" class="col-9" />
      <q-btn
        class="col"
        :color="$q.dark.isActive ? 'elev-8dp' : 'grey-7'"
        flat
        icon="eva-expand-outline"
        :to="{ name: 'mindtree', params: { tree: tree } }"
        label
      >
        <q-tooltip>open in mindtree</q-tooltip>
      </q-btn>
    </div>

    <q-splitter
      horizontal
      v-model="splitter"
      before-class="noscroll row items-stretch"
      after-class="noscroll row items-stretch"
      class="col"
    >
      <template v-slot:before>
        <div
          class="col-12 column"
          @keyup.n="newNote"
          @keyup.46.exact="confirmDeleteNote"
          @keyup.shift.46="deleteNote"
        >
          <q-scroll-area class="col">
            <q-tree
              :nodes="[trees[tree][tree]]"
              node-key="note"
              label-key="note"
              :filter="filter"
              :filter-method="myFilterMethod"
              default-expand-all
              @update:selected="selectedTreeNode = target"
            >
              <template v-slot:default-header="prop">
                <tree-node :note="prop.node.note" :tree="prop.tree" />
              </template>
            </q-tree>
          </q-scroll-area>
        </div>
      </template>
      <template v-slot:after>
        <q-list
          class="col-12 column"
          @dragover="
            $event.dataTransfer.types.includes('note')
              ? $event.preventDefault()
              : ''
          "
          @drop="detachedDrop"
        >
          <q-scroll-area class="col">
            <q-item-label header>Detached Notes</q-item-label>
            <q-item
              draggable="true"
              v-for="note in detached"
              :key="note"
              :to="{
                name: 'noteView',
                params: { tree: tree, note: note }
              }"
              @dragstart="onDragStart($event, note)"
            >{{ notes[note].title }}</q-item>
          </q-scroll-area>
        </q-list>
      </template>
    </q-splitter>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TreeNode from "components/TreeNode.vue";
import Confirm from "components/dialogs/Confirm.vue";
import fuzzysearch from "../utils/fuzzysearch.js";

export default {
  name: "NoteTree",
  props: {
    tree: Number
  },
  components: { TreeNode },
  data() {
    return {
      filter: "",
      selectedTreeNode: null,
      splitter: 65
    };
  },
  computed: {
    ...mapState("notes", ["notes", "trees"]),
    detached() {
      let res = [];
      for (let note in this.notes) {
        note = parseInt(note);
        if (note < 0) continue;
        if (this.trees[this.tree][parseInt(note)] === undefined) {
          res.push(parseInt(note));
        }
      }
      return res;
    }
  },
  methods: {
    myFilterMethod(node, filter) {
      return (
        this.notes[node.note] &&
        fuzzysearch(filter, this.notes[node.note].title)
      );
    },
    newNote() {
      this.sockets.subscribe("new note ack", noteId => {
        if (this.selectedTreeNode != null) {
          this.$socket.emit("move note", {
            noteId: noteId,
            treeId: this.tree,
            parentId: this.selectedTreeNode
          });
        }
        this.$router.push({
          name: "noteView",
          params: { tree: this.tree, note: noteId },
          query: { edit: true }
        });
        this.sockets.unsubscribe("new note ack");
      });
      this.$socket.emit("new note", { title: "new note" });
    },
    deleteNote() {
      let parent = this.$store.state.notes.trees[this.tree][
        this.selectedTreeNode
      ].parent;
      this.$socket.emit("delete note", this.selectedTreeNode);
      this.$router.push({
        name: "noteView",
        params: { tree: this.tree, note: parent }
      });
    },
    confirmDeleteNote() {
      this.$q
        .dialog({
          component: Confirm,
          parent: this,
          message: `Are you sure you want to permanently delete '${
            this.notes[this.selectedTreeNode].title
          }'?`
        })
        .onOk(() => {
          this.deleteNote();
        });
    },
    onDragStart(e, note) {
      e.dataTransfer.setData("note", note);
      e.dataTransfer.dropEffect = "move";
    },
    detachedDrop(e) {
      let note = parseInt(e.dataTransfer.getData("note"));
      this.$socket.emit("remove from tree", { tree: this.tree, note: note });
      e.preventDefault();
    }
  },
  watch: {
    $route(to, from) {
      this.selectedTreeNode = parseInt(this.$route.params.note);
    }
  },
  mounted() {
    this.selectedTreeNode = parseInt(this.$route.params.note);
  }
};
</script>
