<template>
  <div :class="{ 'drag-enter-light': inDrag && !$q.dark.isActive,  'drag-enter-dark': inDrag && $q.dark.isActive}">
    <q-item
      dense
      :to="{name: 'noteView', params: { tree: tree.nodes[0].note, note: note}}"
      :active="active"
      draggable="true"
      @dragstart="onDragStart"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
      @dragend="onDragEnd"
      v-if="!edit"
      @dblclick.stop="enterEdit"
      @keyup="newNote"
      class="q-pa-xs"
    >
      {{ title }}
      <div class="q-pl-sm q-gutter-xs">
        <q-badge
          v-for="(tag, i) in notes[note].tags"
          :key="i"
          color="primary"
        > {{ tag }} </q-badge>
      </div>
    </q-item>
    <q-input
      v-if="edit"
      v-model="title"
      @click.stop
      @keypress.stop
      @keyup.stop
      @keypress.13.stop="exitEdit"
      @blur="exitEdit"
      square
      outlined
      dense
      autofocus
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TreeNode',
  props: ['note', 'tree'],
  components: {},
  data () {
    return {
      edit: false,
      active: false,
      inDrag: 0,
      isDragged: false
    }
  },
  computed: {
    ...mapState('notes', [
      'notes',
      'trees',
      'flattenTrees'
    ]),
    title: {
      get () {
        return this.notes[this.note].title
      },
      set (v) {
        this.$store.commit('notes/updateNote', { note: this.note, title: v });
      }
    },
    // active: {
    //   get () {
    //     return this._active
    //   },
    //   set (v) {
    //     console.log('active')
    //     this._active = v
    //     let note = this.note
    //     while (note != null) {
    //       console.log(note)
    //       this.tree.setExpanded(note, true)
    //       note = this.flattenTrees[this.tree.nodes[0].note][note].parent
    //     }
    //   }
    // }
  },
  methods: {
    // store the id of the draggable element
    enterEdit (e) {
      this.edit = true
    },
    exitEdit (e) {
      this.edit = false
    },

    onDragStart (e) {
      e.dataTransfer.setData('note', this.note)
      e.dataTransfer.dropEffect = 'move'
      this.isDragged = true
    },

    onDragEnd (e) {
      this.isDragged = false
    },

    onDragEnter (e) {
      if (!this.isDragged) {
        this.inDrag += 1
        this.$emit('dragEntered')
      }
    },

    onDragLeave (e) {
      if (this.isDragged) return
      this.inDrag -= 1
      if (this.inDrag < 0) this.inDrag = 0
    },

    onDragOver (e) {
      if (!this.isDragged) {
        e.preventDefault()
      }
    },

    onDrop (e) {
      if (!this.inDrag) return
      this.inDrag = 0
      e.preventDefault()
      this.$store.commit('notes/moveNote', { tree: this.tree.nodes[0].note, note: parseInt(e.dataTransfer.getData('note')), newParent: this.note });
      this.expandPath(this.note)
    },

    newNote (e) {
      console.log(e)
      this.$store.commit("notes/newNote", { title: "new note", tree: this.tree, parent: this.note })
      this.$router.push({ name: 'noteView', params: { tree: this.tree, note: this.$store.state.notes.lastCreatedNote } })
    },

    expandPath (note) {
      while (note != null) {
        this.tree.setExpanded(note, true)
        if (!this.flattenTrees || !this.flattenTrees[this.tree.nodes[0].note]) break
        note = this.flattenTrees[this.tree.nodes[0].note][note].parent
      }
    }
  },
  watch: {
    $route (to, from) {
      if (parseInt(this.$route.params.note) == this.note) {
        this.expandPath(this.note)
      }
    }
  },
  mounted: function () {
    // this.note = parseInt(this.note)
    if (parseInt(this.$route.params.note) == this.note) {
      this.expandPath(this.note)
    }
  },
  updated: function () {
    if (parseInt(this.$route.params.note) == this.note) {
      this.expandPath(this.note)
    }
  }

}
</script>

<style>
.drag-enter-light {
  outline: 1px solid #000000;
  outline-style: dashed;
}
.drag-enter-dark {
  outline: 1px solid #ffffff;
  outline-style: dashed;
}
</style>