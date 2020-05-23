<template>
  <q-page
    class="column"
    @keyup.up.ctrl.stop="
      parent !== null
        ? $router.push({
            name: 'noteView',
            params: { tree: tree, note: parent }
          })
        : ''
    "
  >
    <div class="col-auto q-pa-sm row-inline q-gutter-y-sm">
      <q-btn
        :disable="parent === null"
        :to="{
          name: 'noteView',
          params: { tree: tree, note: parent }
        }"
        class="self-start"
        :class="$q.dark.isActive ? 'elev-08dp' : 'bg-grey-3'"
      >
        ...
        <q-tooltip dir="ltr">Go To Parent (CTRL + UP)</q-tooltip>
      </q-btn>
      <note-card class="col-12" primary :note="note" />
    </div>
    <q-separator style="height: 1px" />
    <div class="col q-pa-sm row items-stretch">
      <router-view />
    </div>
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
    parent() {
      if (!this.trees[this.tree]) return null;
      if (!this.trees[this.tree][this.note]) return null;
      return this.trees[this.tree][this.note].parent;
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
