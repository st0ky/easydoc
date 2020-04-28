<template>
  <q-tree :nodes="[fileTrees[tree]]" node-key="fileId" label-key="name">
    <template v-slot:default-header="{ node }">
      <q-item
        :to="
          !node.dir
            ? {
                name: primary ? 'code' : 'noteCode',
                params: recalcParams($route.params, node),
                query: $route.query
              }
            : ''
        "
      >
        {{ node.name }}
      </q-item>
    </template>
  </q-tree>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "FileTree",
  props: {
    tree: Number
  },
  components: {},
  data() {
    return {
      primary: true
    };
  },
  computed: {
    ...mapState("socket", ["fileTrees"]),
    routeName() {
      return this.$route.name ? this.$route.name : "";
    }
  },
  methods: {
    recalcParams(oldParams, node) {
      let params = { ...oldParams };
      params.fileId = node.fileId;
      params.line = node.line !== undefined ? node.line : 0;
      params.endLine = node.endLine !== undefined ? node.endLine : -1;
      params.startCol = node.startCol !== undefined ? node.startCol : -1;
      params.endCol = node.endCol !== undefined ? node.endCol : -1;
      return params;
    }
  },
  mounted() {
    this.primary = !this.routeName.startsWith("note");
  },
  watch: {
    routeName(to, from) {
      this.primary = !to.startsWith("note");
    }
  }
};
</script>
