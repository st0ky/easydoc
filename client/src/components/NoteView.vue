<template>
  <q-page class="q-pa-md q-gutter-md column">
    <note-card
      v-if="_note !== null"
      primary
      :note="_note"
    />
    <q-separator v-if="_note !== null" />
    <div
      class="q-gutter-xs row"
      v-if="_note !== null"
    >
      <note-card
        v-for="child in $store.state.notes.flattenTrees[tree][_note].children"
        :key="child.note"
        :note="child.note"
        clickable
        style="max-width: 50%"
      />
    </div>
  </q-page>

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
    _note () {
      if (this.$store.state.notes.flattenTrees[this.tree] === undefined) {
        return null
      }
      return this.note
    }
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
