<template>
  <q-tree
    :nodes="[fileTrees[tree]]"
    node-key="fileId"
    label-key="name"
  >
    <template v-slot:default-header="{node}">
      <q-item> {{ node.name }} </q-item>

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
  }
}
</script>
