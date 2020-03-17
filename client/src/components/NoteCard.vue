<template>
  <div>
    <q-card
      flat
      bordered
      class="my-card bg-grey-1"
    >
      <q-card-section>
        <div class="row items-center no-wrap fit">
          <div class="col-5">
            <div
              v-if="!edit_mode"
              :class="{'text-h6' : title.length < 10}"
            > {{ title }} </div>
            <q-input
              v-model="title"
              v-if="edit_mode"
              filled
              clearable
              dense
            />
          </div>

          <div class="col-4">
            <q-select
              v-if="edit_mode"
              label="tags"
              filled
              v-model="tags"
              use-input
              use-chips
              multiple
              :options="$store.state.notes.tags"
              input-debounce="0"
              dense
              new-value-mode="add-unique"
            />
            <template v-if="!edit_mode">
              <q-chip
                size="sm"
                color="primary"
                text-color="white"
                v-for="(tag, idx) in tags"
                :key="idx"
                :removable="edit_mode"
                @remove="remove_chip(tag)"
              > {{tag}} </q-chip>
            </template>
          </div>

          <div class="col-3 row justify-end">
            <q-btn
              color="grey-7"
              round
              flat
              icon="edit"
              v-if="!edit_mode && editable"
              @click="enter_edit"
            />
            <q-btn
              color="green"
              round
              flat
              icon="done"
              v-if="edit_mode"
            />
            <q-btn
              color="red"
              round
              flat
              icon="cancel"
              v-if="edit_mode"
            />
            <q-btn
              color="grey-7"
              round
              flat
              icon="delete"
              v-if="!edit_mode"
            />
          </div>
        </div>
      </q-card-section>
      <q-separator
        inset
        v-if="content"
      />
      <q-card-section v-if="content || edit_mode">
        <q-input
          v-model="content"
          v-if="edit_mode"
          filled
          autogrow
          type="textarea"
        />
        <vue-markdown :source="content" />
      </q-card-section>

      <q-separator v-if="links.length" />
      <q-card-actions
        vertical
        v-if="links.length"
      >
        <q-btn
          flat
          v-for="(link, idx) in links"
          :key="idx"
        > {{link}} </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'

export default {
  name: 'NoteCard',
  props: {
    note: Number,
    editable: Boolean,
  },
  components: { VueMarkdown },
  data () {
    return {
      edit_mode: false,
      edited_note: {
        title: 'note.title.copy()asd',
        content: 'i am a ~~tast~~ **test**.',
        tags: [],
        links: []
      },
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    }
  },
  computed: {
    title: {
      get () { return this.$store.state.notes.notes[this.note].title },
      set (v) { this.$store.commit('notes/updateNote', { note: this.note, title: v ? v : "" }) }
    },
    content: {
      get () { return this.$store.state.notes.notes[this.note].content },
      set (v) { this.$store.commit('notes/updateNote', { note: this.note, content: v }) }
    },
    tags: {
      get () { return this.$store.state.notes.notes[this.note].tags },
      set (v) { this.$store.commit('notes/updateNote', { note: this.note, tags: v }) }
    },
    links () { return this.$store.state.notes.notes[this.note].links },
  },
  methods: {
    enter_edit () {
      this.edit_mode = true
      this.edited_note = {
        title: this.title,
        content: this.content,
        tags: this.tags.slice(),
        links: this.links.slice()
      }
    },
    remove_chip (chip) {
      this.$store.commit('notes/removeTag', { note: this.note, tag: chip })
    }
  },
  watch: {
    $route (to, from) {
      this.edit_mode = false
    }
  },
  mounted () {
    console.log("dispatch('notes/prepareTags')")
    this.$store.dispatch('notes/prepareTags')
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 500px
</style>
