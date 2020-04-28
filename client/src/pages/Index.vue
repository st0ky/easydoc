<template>
  <q-page>
    <note-card primary :note="-2" class="q-pa-md" />
    <q-separator />
    <q-list class="q-pa-md q-gutter-md column items-start">
      <div class="text-h6">Trees:</div>
      <template v-for="(value, tree, index) in $store.state.notes.trees">
        <q-item
          :to="{
            name: 'noteView',
            params: { tree: parseInt(tree), note: parseInt(tree) }
          }"
          :key="index"
          class="q-pa-none"
        >
          <note-card :note="parseInt(tree)" />
        </q-item>
      </template>
    </q-list>
  </q-page>
</template>

<script>
import NoteCard from "components/NoteCard.vue";

export default {
  name: "PageIndex",
  components: { NoteCard },
  computed: {
    focusedNote: {
      get() {
        if (!this.$store.state.notes.focus) {
          return false;
        }
        return this.$store.state.notes.notes[this.$store.state.notes.focus];
      }
    },
    notes: {
      get() {
        return this.$store.state.notes.notes;
      }
    }
  },
  data() {
    return {};
  }
};
</script>
