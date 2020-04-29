<template>
  <q-page
    @keyup.up.ctrl.stop="
      trees[tree][note].parent !== null
        ? $router.push({
            name: 'noteView',
            params: { tree: tree, note: trees[tree][note].parent }
          })
        : ''
    "
  >
    <q-splitter v-model="splitterModel" horizontal v-if="valid">
      <template v-slot:before>
        <div class="column q-pa-md q-gutter-sm">
          <q-btn
            :disable="trees[tree][note].parent === null"
            :to="{
              name: 'noteView',
              params: { tree: tree, note: trees[tree][note].parent }
            }"
            class="self-start"
            :class="$q.dark.isActive ? 'elev-08dp' : 'bg-grey-3'"
          >
            ...
            <q-tooltip>Go To Parent (CTRL + UP)</q-tooltip>
          </q-btn>
          <note-card primary :note="note" />
        </div>
      </template>
      <template v-slot:after>
        <router-view class="q-ma-md" />
      </template>
    </q-splitter>
  </q-page>
</template>

<script>
import { mapState } from "vuex";
import NoteCard from "components/NoteCard.vue";

export default {
  name: "Note",
  props: {
    note: { type: Number, required: true },
    tree: { type: Number, required: true }
  },
  components: { NoteCard },
  data() {
    return {
      splitterModel: 50
    };
  },
  computed: {
    ...mapState("notes", ["notes", "trees"]),
    valid() {
      if (this.$store.state.notes.notes[this.note] === undefined) return null;
      return true;
    }
  },
  methods: {},
  watch: {
    $route(to, from) {
      this.note = this.note;
    }
  }
};
</script>
