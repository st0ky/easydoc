<template>
  <div
    class="q-pa-md q-gutter-sm row items-start"
    v-if="valid"
  >
    <template v-for="child in $store.state.notes.trees[tree][note].children">
      <q-item
        :to="{name: 'noteView', params: { tree: tree, note: child.note}}"
        :key="child.note"
        style="max-width: 50%"
        class="q-pa-none"
      >
        <note-card :note="child.note" />
      </q-item>
    </template>
  </div>

</template>

<script>

import NoteCard from 'components/NoteCard.vue'


export default {
  name: 'Note',
  props: ['tree', 'note'],
  components: { NoteCard },
  data () {
    return {
    }
  },
  computed: {
    valid () {
      if (this.$store.state.notes.trees[this.tree] === undefined) return null
      if (this.$store.state.notes.trees[this.tree][this.note] === undefined) return null
      if (this.$store.state.notes.notes[this.note] === undefined) return null
      return true
    }
  },
  watch: {
    $route (to, from) {
      this.tree = this.tree
      this.note = this.note
    }
  }
}
</script>