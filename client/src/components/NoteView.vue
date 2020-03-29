<template>
  <q-page>
    <q-splitter
      v-model="splitterModel"
      horizontal
      v-if="_note !== null"
      style="height: 100%"
    >
      <template v-slot:before>
        <div class="q-pa-md">
          <note-card
            primary
            :note="_note"
          />
        </div>
      </template>
      <template v-slot:after>
        <div class="q-pa-md q-gutter-xs row items-start">
          <template v-for="child in $store.state.notes.flattenTrees[tree][_note].children">
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
    </q-splitter>

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
      splitterModel: 50
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
