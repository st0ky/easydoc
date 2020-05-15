<template>
  <q-select
    ref="select"
    filled
    hide-dropdown-icon
    use-input
    :placeholder="hint"
    hide-bottom-space
    v-model="model"
    clearable
    @input="
      $router.push({
        name: 'noteView',
        params: { tree: tree, note: $event }
      });
      model = '';
    "
    :options="options"
    @filter="filterFn"
  >
    <template v-slot:append>
      <q-icon v-if="!$refs.select || !$refs.select.inputValue" name="search" />
      <q-icon
        v-else
        name="clear"
        class="cursor-pointer"
        @click="$refs.select.inputValue = ''"
      />
    </template>
    <template v-slot:option="{ index, opt, focused }">
      <q-item
        :to="{
          name: 'noteView',
          params: { tree: tree, note: opt }
        }"
        manual-focus
        :focused="focused"
        class="q-hoverable"
      >
        <q-item-section>
          <q-item-label> {{ notes[opt].title }}</q-item-label>
          <q-item-label caption lines="2">
            {{ notes[opt].content }}</q-item-label
          >
        </q-item-section>
        <q-item-section side top class="q-gutter-xs">
          <q-badge
            v-for="tag in notes[opt].tags"
            :key="tag"
            color="primary"
            text-color="on-primary"
            :label="tag"
          />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from "vuex";
import fuzzysearch from "../utils/fuzzysearch.js";

export default {
  name: "Search",
  props: { hint: { type: String, default: "" } },
  components: {},
  data() {
    return {
      primary: true,
      model: "",
      options: [1, 2, 3]
    };
  },
  computed: {
    ...mapState("notes", ["notes", "trees"]),
    tree() {
      if (this.$route.params.tree !== undefined)
        return parseInt(this.$route.params.tree);
      if (this.$route.params.treeId !== undefined)
        return parseInt(this.$route.params.treeId);
      return parseInt(Object.keys(this.trees)[0]);
    },
    notesIndices() {
      let res = [];
      for (let note of Object.values(this.notes)) {
        if (note.id < 0) continue;
        res.push(note.id);
      }
      return Object.freeze(res);
    }
  },
  methods: {
    focus() {
      this.$refs.select.focus();
    },
    filterFn(val, update, abort) {
      if (!val) {
        update(() => {
          this.options = this.notesIndices;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.options = Object.freeze(
          this.notesIndices
            .map(v => [
              fuzzysearch(
                needle,
                (
                  this.notes[v].tags.join(" ") +
                  this.notes[v].title +
                  this.notes[v].content
                ).toLowerCase()
              ),
              v
            ])
            .filter(([score, v]) => score)
            .sort(([score1, v1], [score2, v2]) => score2 - score1)
            .slice(0, 30)
            .map(([score, v]) => v)
        );
      });
    }
  },
  mounted() {},
  watch: {
    notesIndices(to, from) {
      this.options = to;
    }
  }
};
</script>
