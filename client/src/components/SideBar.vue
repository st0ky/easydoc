<template>
    <aside class="sidebar">
        <div class="tree-container">
          <sl-vue-tree v-model="nodes"/>
        </div>
    </aside>
</template>


<script>
import SlVueTree from 'sl-vue-tree';
import 'sl-vue-tree/dist/sl-vue-tree-dark.css';

const nodes = [
  { title: 'Item1', isLeaf: true },
  { title: 'Item2', isLeaf: true, data: { visible: false } },
  { title: 'Folder1' },
  {
    title: 'Folder2',
    isExpanded: true,
    children: [
      { title: 'Item3', isLeaf: true },
      { title: 'Item4', isLeaf: true },
    ],
  },
];

export default {
  name: 'SideBar',
  components: {
    SlVueTree,
  },
  data: function data() {
    return { nodes };
  },
};
</script>

<style scoped>
/* h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
} */
tree-container {
    /* width: 100%; */
    height: 100%;
    display:inline-block;
    flex-grow: 1;
}
</style>
