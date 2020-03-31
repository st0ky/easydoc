<template>
  <div>
    <q-card
      flat
      bordered
      class="my-card"
      :class="[$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1', primary && note > -1 ? 'cursor-pointer' : ''] "
      v-if="$store.state.notes.notes[note]"
      @keyup.esc="cancel"
      @keyup.ctrl.enter="exit_edit"
    >
      <q-card-section>
        <div class="row items-center no-wrap fit">
          <div
            :class="primary? 'col-5' : 'col-6'"
            @dblclick="primary && !edit_mode ? enter_edit('title') : '' "
          >
            <div
              v-if="!edit_mode"
              :class="{'text-h6' : title.length < 10 || this.primary}"
            > {{ title }} </div>
            <q-input
              v-model="title"
              v-if="edit_mode"
              filled
              clearable
              dense
              :autofocus="focus == 'title'"
            />
          </div>

          <div
            :class="primary? 'col-4' : 'col-6'"
            @dblclick="primary && !edit_mode ? enter_edit('tags') : '' "
          >
            <q-select
              :autofocus="focus == 'tags'"
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
              > {{tag}} </q-chip>
            </template>
          </div>

          <div
            class="col-3 row justify-end"
            v-if="primary"
          >
            <q-btn
              :color="$q.dark.isActive ? '' : 'grey-7'"
              round
              flat
              icon="edit"
              v-if="note != -1 && !edit_mode"
              @click="enter_edit('title')"
            />
            <q-btn
              color="green"
              round
              flat
              icon="done"
              @click="exit_edit"
              v-if="edit_mode"
            />
            <q-btn
              color="red"
              round
              flat
              icon="cancel"
              @click="cancel"
              v-if="edit_mode"
            />
            <q-btn
              :color="$q.dark.isActive ? '' : 'grey-7'"
              round
              flat
              @click="$store.commit('notes/deleteNote', note)"
              icon="delete"
              v-if="note > -1 && !edit_mode && !$store.state.notes.trees[note]"
            />
          </div>
        </div>
      </q-card-section>
      <q-separator
        inset
        v-if="content"
      />
      <q-card-section
        v-if="content || edit_mode"
        @dblclick="primary && !edit_mode ? enter_edit('content') : '' "
      >
        <q-input
          v-model="content"
          v-if="edit_mode"
          filled
          autogrow
          type="textarea"
          :autofocus="focus == 'content'"
        />
        <vue-markdown :source="content" />
      </q-card-section>

      <q-separator v-if="links.length" />
      <q-card-actions
        vertical
        v-if="links.length"
        @dblclick="primary && !edit_mode ? enter_edit('links') : '' "
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
    primary: Boolean,
  },
  components: { VueMarkdown },
  data () {
    return {
      edit_mode: false,
      focus: null,
      originalNote: {
        title: '',
        content: '',
        tags: [],
        links: []
      },
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
    enter_edit (target = null) {
      if (this.note == -1) return
      this.edit_mode = true
      this.originalNote = {
        title: this.title,
        content: this.content,
        tags: this.tags.slice(),
        links: this.links.slice()
      }
      this.focus = target
    },
    exit_edit () {
      this.edit_mode = false
      if (this.$route.query.edit) {
        let newQuery = { ...this.$route.query }
        delete newQuery.edit
        this.$router.replace({ query: newQuery })
      }
    },
    cancel () {
      this.exit_edit()
      this.$store.commit('notes/updateNote', {
        note: this.note,
        title: this.originalNote.title,
        content: this.originalNote.content,
        tags: this.originalNote.tags,
        links: this.originalNote.links
      })
    }
  },
  watch: {
    $route (to, from) {
      if (this.$route.query.edit && !this.edit_mode) {
        this.enter_edit('title')
        return
      }
      this.exit_edit()

    }
  },
  mounted () {
    this.$store.dispatch('notes/prepareTags')
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
