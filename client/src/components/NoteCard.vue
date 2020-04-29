<template>
  <q-item
    class="q-pa-none"
    :to="
      !special && primary
        ? {
            name: 'noteView',
            params: { tree: $route.params.tree, note: $route.params.note }
          }
        : ''
    "
  >
    <q-card
      flat
      bordered
      class="my-card"
      :class="[
        $q.dark.isActive ? (primary ? 'elev-08dp' : 'elev-1dp') : 'bg-grey-3',
        primary && note != -1 ? 'cursor-pointer' : ''
      ]"
      v-if="notes[note]"
      @keyup.esc.stop="cancel"
      @keyup.ctrl.enter.stop="exit_edit"
      @dblclick.stop="primary && !edit_mode ? enter_edit('title') : ''"
      @click.self.stop="
        !special && primary
          ? $router.replace({
              name: 'noteView',
              params: { tree: $route.params.tree, note: $route.params.note }
            })
          : ''
      "
    >
      <q-card-section>
        <div class="row items-center no-wrap fit">
          <div
            :class="primary ? 'col-5' : 'col-6'"
            @dblclick.stop="primary && !edit_mode ? enter_edit('title') : ''"
          >
            <div
              v-if="!edit_mode"
              :class="{ 'text-h6': title.length < 10 || this.primary }"
            >
              {{ title }}
            </div>
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
            :class="primary ? 'col-4 justify-start' : 'col justify-center'"
            class="row "
            @dblclick.stop="primary && !edit_mode ? enter_edit('tags') : ''"
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
                :size="primary ? '' : 'sm'"
                color="primary"
                text-color="on-primary"
                v-for="(tag, idx) in tags"
                :key="idx"
              >
                {{ tag }}
              </q-chip>
            </template>
          </div>

          <div class="col-3 row justify-end" v-if="primary">
            <q-btn
              :color="$q.dark.isActive ? 'elev-2dp' : 'grey-7'"
              round
              flat
              icon="edit"
              v-if="note != -1 && !edit_mode"
              @click="enter_edit('title')"
            >
              <q-tooltip>edit note (double click)</q-tooltip>
            </q-btn>
            <q-btn
              color="green"
              round
              flat
              icon="done"
              @click="exit_edit"
              v-if="edit_mode"
            >
              <q-tooltip>end editing (CTRL + ENTER)</q-tooltip>
            </q-btn>
            <q-btn
              color="red"
              round
              flat
              icon="cancel"
              @click="cancel"
              v-if="edit_mode"
            >
              <q-tooltip>cancel editing (Esc)</q-tooltip>
            </q-btn>
            <q-btn
              :color="$q.dark.isActive ? 'elev-2dp' : 'grey-7'"
              round
              flat
              @click="$socket.emit('delete note', note)"
              icon="delete"
              v-if="note > -1 && !edit_mode && !treeNotes.indexOf(note) != -1"
            >
              <q-tooltip>delete note</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-separator inset v-if="content" />
      <q-card-section
        v-if="content || edit_mode"
        @dblclick.stop="primary && !edit_mode ? enter_edit('content') : ''"
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

      <q-separator v-if="(links.length || edit_mode) && !special" />
      <q-card-actions
        vertical
        v-if="(links.length || edit_mode) && !special"
        @dblclick.stop="primary && !edit_mode ? enter_edit('links') : ''"
      >
        <template v-for="(link, idx) in links">
          <div class="row" :key="idx">
            <q-btn
              v-if="edit_mode"
              icon="cancel"
              rounded
              flat
              size="sm"
              :color="$q.dark.isActive ? 'elev-2dp' : 'grey-7'"
              class="col-1"
              @click="
                $socket.emit('update note', {
                  id: note,
                  links: links.slice(0, idx).concat(links.slice(idx + 1))
                })
              "
            >
              <q-tooltip>remove link</q-tooltip>
            </q-btn>
            <note-link flat v-bind="link" :class="edit_mode ? 'col-11' : ''" />
          </div>
        </template>
        <q-list class="row q-gutter-sm" v-if="edit_mode">
          <q-btn
            class="col-1"
            :color="$q.dark.isActive ? 'elev-2dp' : 'grey-7'"
            flat
            icon="add"
            @click="addLink"
          >
            <q-tooltip
              >Add note link<br />To add code link choose first file from file
              tree</q-tooltip
            >
          </q-btn>
          <q-select
            hint="select note"
            class="col-grow"
            :options="noteOptions"
            @filter="filterFn"
            v-model="noteModel"
            use-input
            input-debounce="0"
            :autofocus="focus == 'links'"
          />
          <q-select
            hint="select tree"
            class="col-4"
            :options="treeOptions"
            v-model="treeModel"
            use-input
            input-debounce="0"
          />
        </q-list>
      </q-card-actions>
    </q-card>
  </q-item>
</template>

<script>
import { mapState } from "vuex";

import VueMarkdown from "vue-markdown";
import NoteLink from "components/NoteLink.vue";
import fuzzysearch from "../utils/fuzzysearch.js";

export default {
  name: "NoteCard",
  props: {
    note: { type: Number, required: true },
    primary: { type: Boolean, default: false }
  },
  components: { VueMarkdown, NoteLink },
  data() {
    return {
      edit_mode: false,
      focus: null,
      originalNote: {
        title: "",
        content: "",
        tags: [],
        links: []
      },
      noteOptions: [],
      treeOptions: [],
      noteModel: null,
      treeModel: null
    };
  },
  computed: {
    ...mapState("notes", ["notes", "trees"]),
    ...mapState("socket", ["treeNotes"]),
    special() {
      return this.note < 0;
    },
    title: {
      get() {
        return this.notes[this.note].title;
      },
      set(v) {
        this.$socket.emit("update note", { id: this.note, title: v ? v : "" });
      }
    },
    content: {
      get() {
        return this.notes[this.note].content;
      },
      set(v) {
        this.$socket.emit("update note", { id: this.note, content: v });
      }
    },
    tags: {
      get() {
        return this.notes[this.note].tags;
      },
      set(v) {
        this.$socket.emit("update note", { id: this.note, tags: v });
      }
    },
    links() {
      return this.notes[this.note].links;
    },
    noteTitles() {
      let res = [];
      for (let note of Object.values(this.notes)) {
        if (note.id < 0) continue;
        res.push({ label: note.title, value: note.id });
      }
      return Object.freeze(res);
    },
    treeTitles() {
      let res = [];
      for (let tree of Object.keys(this.trees)) {
        tree = parseInt(tree);
        res.push({ label: this.notes[tree].title, value: tree });
      }
      return Object.freeze(res);
    }
  },
  methods: {
    enter_edit(target = null) {
      if (this.note == -1) return;
      this.edit_mode = true;
      this.originalNote = {
        title: this.title,
        content: this.content,
        tags: this.tags.slice(),
        links: this.links.slice()
      };
      this.focus = target;
      this.noteModel = null;
      this.treeModel = null;
    },
    exit_edit() {
      this.edit_mode = false;
      if (this.$route.query.edit) {
        let newQuery = { ...this.$route.query };
        delete newQuery.edit;
        this.$router.replace({ query: newQuery });
      }
    },
    cancel() {
      this.exit_edit();
      this.$socket.emit("update note", {
        id: this.note,
        title: this.originalNote.title,
        content: this.originalNote.content,
        tags: this.originalNote.tags,
        links: this.originalNote.links
      });
    },
    filterFn(val, update, abort) {
      if (!val) {
        update(() => {
          this.noteOptions = this.noteTitles;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();

        this.noteOptions = Object.freeze(
          this.noteTitles.filter(v =>
            fuzzysearch(needle, v.label.toLowerCase())
          )
        );
      });
    },
    createValue(val) {
      this.$socket.emit("update note", {
        id: this.note,
        links: this.links.concat([{ type: "note", noteId: val.value }])
      });
      this.model = null;
    },
    addLink() {
      if (this.noteModel === null) return;
      let link =
        this.treeModel === null
          ? { type: "note", noteId: this.noteModel.value }
          : {
              type: "note",
              noteId: this.noteModel.value,
              treeId: this.treeModel.value
            };
      this.$socket.emit("update note", {
        id: this.note,
        links: this.links.concat([link])
      });
      this.noteModel = null;
      this.treeModel = null;
    }
  },
  watch: {
    $route(to, from) {
      if (this.$route.query.edit && !this.edit_mode) {
        this.enter_edit("title");
        return;
      }
      this.exit_edit();
    },
    noteTitles(to, from) {
      this.noteOptions = to;
    },
    treeTitles(to, from) {
      this.treeOptions = to;
    }
  },
  mounted() {
    this.$store.dispatch("notes/prepareTags");
    this.noteOptions = this.noteTitles;
    this.treeOptions = this.treeTitles;
  }
};
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
