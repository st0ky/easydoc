<template>
  <q-input
    v-model="title"
    @click.stop
    @keypress.13.32.stop
    keep-alive
  />
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TreeNode',
  props: ['note'],
  components: {},
  data () {
    return {}
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
        console.log(v)
        this.$store.commit('notes/updateNote', { note: this.note, title: v });
      }
    }
  },

}
</script>