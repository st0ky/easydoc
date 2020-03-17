<template>
  <note-card
    v-if="note !== null"
    editable
    :note="note"
  />
</template>

<script>

import NoteCard from 'components/NoteCard.vue'


export default {
  name: 'NoteView',
  props: ['tree', 'note'],
  components: { NoteCard },
  data () {
    return {
    }
  },
  computed: {
    focusedNote: {
      get () {
        if (!this.$store.state.notes.focus) {
          return false
        }
        return this.$store.state.notes.notes[this.$store.state.notes.focus]
      }
    },
  },
  methods: {

  },
  watch: {
    $route (to, from) {
      this.tree = this.tree
      this.note = this.note
    }
  },
  mounted () {
    this.$store.commit("notes/createFlattenTrees")
  }
}
</script>

<style lang="sass" scoped>
</style>
