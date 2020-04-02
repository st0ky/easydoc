<template>
  <div
    @keyup.n="newNote"
    @keyup.insert="newNote"
    @keyup.46.exact="confirmDeleteNote"
    @keyup.shift.46="deleteNote"
  >
    <q-tree
      :nodes="[trees[tree][tree]]"
      node-key="note"
      label-key="note"
      default-expand-all
      @update:selected="selectedTreeNode=target"
    >
      <template v-slot:default-header="prop">
        <tree-node
          :note="prop.node.note"
          :tree="prop.tree"
        />

      </template>
    </q-tree>
  </div>
</template>

<script>

import { mapState } from 'vuex'
import TreeNode from 'components/TreeNode.vue'
import Confirm from 'components/dialogs/Confirm.vue'

export default {
  name: 'NoteTree',
  props: {
    tree: Number
  },
  components: { TreeNode },
  data () {
    return {
      selectedTreeNode: null
    };
  },
  computed: {
    ...mapState('notes', [
      'notes',
      'trees'
    ]),
  },
  methods: {
    newNote () {
      this.sockets.subscribe("new note ack", (noteId) => {
        if (this.selectedTreeNode != null) {
          this.$socket.emit("move note", { noteId: noteId, treeId: this.tree, parentId: this.selectedTreeNode })
        }
        this.$router.push({ name: 'noteView', params: { tree: this.tree, note: noteId }, query: { edit: true } })
        this.sockets.unsubscribe("new note ack")

      })
      this.$socket.emit("new note", { title: "new note" })
    },
    deleteNote () {
      let parent = this.$store.state.notes.trees[this.tree][this.selectedTreeNode].parent
      this.$socket.emit('delete note', this.selectedTreeNode)
      this.$router.push({ name: 'noteView', params: { tree: this.tree, note: parent } })
    },
    confirmDeleteNote () {
      this.$q.dialog({
        component: Confirm,
        parent: this,
        message: `Are you sure you want to permanently delete '${this.notes[this.selectedTreeNode].title}'?`
      }).onOk(() => {
        this.deleteNote()
      })

    }
  },
  watch: {
    $route (to, from) {
      this.selectedTreeNode = parseInt(this.$route.params.note)
    }
  },
  mounted () {
    this.selectedTreeNode = parseInt(this.$route.params.note)
  }
}
</script>