<template>
  <q-page>
    <q-splitter v-model="splitterModel" horizontal v-if="valid">
      <template v-slot:before>
        <note-card primary :note="note" class="q-ma-md" />
      </template>
      <template v-slot:after>
        <router-view class="q-ma-md" />
      </template>
    </q-splitter>
  </q-page>
</template>

<script>
import NoteCard from "components/NoteCard.vue";

export default {
  name: "Note",
  props: ["note"],
  components: { NoteCard },
  data() {
    return {
      splitterModel: 50
    };
  },
  computed: {
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
