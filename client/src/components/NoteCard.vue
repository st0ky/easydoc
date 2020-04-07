<template>
  <div>
    <q-card
      flat
      bordered
      class="my-card"
      :class="[$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1', primary && note > -1 ? 'cursor-pointer' : ''] "
      v-if="notes[note]"
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
              debounce="200"
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
              :options="$store.state.socket.tags"
              input-debounce="500"
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
              @click="$socket.emit('delete note', note)"
              icon="delete"
              v-if="note > -1 && !edit_mode && !treeNotes.indexOf(note) != -1"
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
          debounce="200"
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
        <template v-for="(link, idx) in links">
          <div
            class="row"
            :key="idx"
          >
            <q-btn
              v-if="edit_mode"
              icon='cancel'
              rounded
              flat
              size='sm'
              :color="$q.dark.isActive ? '' : 'grey-7'"
              class="col-1"
              @click="$socket.emit('update note', { id: note, links: links.slice(0, idx).concat(links.slice(idx+1)) })"
            />
            <note-link
              flat
              v-bind="link"
              :class="edit_mode ? 'col-11' : ''"
            />

          </div>
        </template>
        <q-select
          v-if="edit_mode"
          hint="add note link"
          :options="options"
          @filter="filterFn"
          @input="createValue"
          v-model="model"
          use-input
          input-debounce="0"
          :autofocus="focus == 'links'"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>

import { mapState } from 'vuex'

import VueMarkdown from 'vue-markdown'
import NoteLink from 'components/NoteLink.vue'
import fuzzysearch from '../utils/fuzzysearch.js'

export default {
  name: 'NoteCard',
  props: {
    note: Number,
    primary: Boolean,
  },
  components: { VueMarkdown, NoteLink },
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
      options: [],
      model: null
    }
  },
  computed: {
    ...mapState('notes', [
      'notes'
    ]),
    ...mapState('socket', [
      'treeNotes'
    ]),
    title: {
      get () { return this.notes[this.note].title },
      set (v) { this.$socket.emit('update note', { id: this.note, title: v ? v : "" }) }
    },
    content: {
      get () { return this.notes[this.note].content },
      set (v) { this.$socket.emit('update note', { id: this.note, content: v }) }
    },
    tags: {
      get () { return this.notes[this.note].tags },
      set (v) { this.$socket.emit('update note', { id: this.note, tags: v }) }
    },
    links () { return this.notes[this.note].links },
    titles () {
      let res = [];
      for (let note of Object.values(this.notes)) {
        if (note.id < 0) continue
        if (this.treeNotes.indexOf(note.id) != -1) continue
        res.push({ label: note.title, value: note.id })
      }
      return res
    }
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
      this.$socket.emit('update note', {
        id: this.note,
        title: this.originalNote.title,
        content: this.originalNote.content,
        tags: this.originalNote.tags,
        links: this.originalNote.links
      })
    },
    filterFn (val, update, abort) {
      if (!val) {
        update(() => { this.options = this.titles })
        return
      }
      update(() => {
        const needle = val.toLowerCase()

        this.options = this.titles.filter(v => fuzzysearch(needle, v.label.toLowerCase()))
      })
    },
    createValue (val) {
      this.$socket.emit('update note', { id: this.note, links: this.links.concat([{ type: 'note', noteId: val.value }]) })
      this.model = null
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
    this.options = this.titles
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
