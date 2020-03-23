<template>
  <div :class="{ 'drag-enter-light': inDrag && !$q.dark.isActive,  'drag-enter-dark': inDrag && $q.dark.isActive}">
    <div
      draggable="true"
      @dragstart="onDragStart"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
      @dragend="onDragEnd"
      v-if="!edit"
      @dblclick.stop="enterEdit"
      class="q-pa-xs"
    >
      <q-item
        dense
        class="q-py-none q-my-none"
        :to="{name: 'noteView', params: { tree: tree.nodes[0].note, note: note}}"
      >
        {{ title }}
      </q-item>
    </div>
    <q-input
      v-if="edit"
      v-model="title"
      @click.stop
      @keypress.32.stop
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
      inDrag: 0,
      isDragged: false
    }
  },
  computed: {
    ...mapState('notes', [
      'notes',
      'trees'
    ]),
    title: {
      get () {
        return this.notes[this.note].title
      },
      set (v) {
        this.$store.commit('notes/updateNote', { note: this.note, title: v });
      }
    }
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