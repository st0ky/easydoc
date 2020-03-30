<template>
  <q-page>
    <q-splitter
      v-model="splitterModel"
      horizontal
      v-if="valid"
      style="height: 100%"
    >
      <template v-slot:before>
        <div class="q-pa-md">
          <note-card
            primary
            :note="note"
          />
        </div>
      </template>
      <template v-slot:after>
        <router-view />
      </template>
    </q-splitter>

  </q-page>

</template>

<script>

import NoteCard from 'components/NoteCard.vue'


export default {
  name: 'Note',
  props: ['tree', 'note'],
  components: { NoteCard },
  data () {
    return {
      splitterModel: 50
    }
  },
  computed: {
    valid () {
      if (this.$store.state.notes.flattenTrees[this.tree] === undefined) {
        return false
      }
      return true
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
