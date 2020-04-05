<template>
  <q-tree
    :nodes="[fileTrees[tree]]"
    node-key="fileId"
    label-key="name"
  >
    <template v-slot:default-header="{node}">
      <q-item :to="!node.dir ? {name: 'code', params: recalcParams($route.params, node), query: $route.query} : ''">
        {{ node.name }}
      </q-item>

    </template>
  </q-tree>
</template>

<script>

import { mapState } from 'vuex'

export default {
  name: 'FileTree',
  props: {
    tree: Number
  },
  components: {},
  data () {
    return {
    };
  },
  computed: {
    ...mapState('socket', [
      'fileTrees'
    ]),
  },
  methods: {
    recalcParams (oldParams, node) {
      let params = { ...oldParams }
      params.fileId = node.fileId
      params.line = node.line !== undefined ? node.line : 0
      return params
    }
  }
}
</script>
