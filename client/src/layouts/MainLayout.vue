<template>
  <q-layout
    view="Lhh Lpr lff"
    :class="$q.dark.isActive ? 'bg-grey-9 text-white' : ''"
  >
    <q-header
      elevated
      :class="$q.dark.isActive ? 'bg-grey-6' : ''"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>
          EasyDoc
        </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="more_vert"
          aria-label="Menu"
        >
          <q-menu>
            <q-list style="min-width: 160px">
              <q-item
                clickable
                v-close-popup
                @click="newTree"
              >
                <q-item-section>New tree</q-item-section>
              </q-item>
              <q-item
                clickable
                @click="newNote"
                v-close-popup
              >
                <q-item-section>New note</q-item-section>
              </q-item>
              <q-item>
                <q-toggle
                  v-model="$q.dark.isActive"
                  label="Dark mode"
                  left-label
                />
              </q-item>

            </q-list>
          </q-menu>
        </q-btn>

      </q-toolbar>
    </q-header>
    <q-splitter
      v-model="splitterModel"
      unit="px"
      emit-immediately
      :class="splitterClass"
      @input="onChange"
    >
      <template v-slot:before>
        <q-drawer
          v-model="leftDrawerOpen"
          show-if-above
          bordered
          :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
          :width="drawerWidth"
          :breakpoint="0"
        >
          <q-tabs
            v-model="tab"
            inline-label
            elevated
            :class="$q.dark.isActive ? '' : 'bg-primary text-white'"
          >
            <q-tab
              class="q-px-xs"
              v-for="(v, tree) in flattenTrees"
              :key="parseInt(tree)"
              :name="parseInt(tree)"
              :label="notes[parseInt(tree)].title"
            />

          </q-tabs>
          <q-separator />
          <q-tab-panels
            v-model="tab"
            @transition="selectedTreeNode=null"
          >
            <template v-for="(v, tree) in flattenTrees">
              <q-tab-panel
                :key="parseInt(tree)"
                :name="parseInt(tree)"
                keep-alive="true"
                @keyup.n="newNote"
                @keyup.insert="newNote"
                @keyup.46="deleteNote(tree, selectedTreeNode)"
              >
                <q-tree
                  :nodes="[v[tree]]"
                  node-key="note"
                  label-key="note"
                  default-expand-all
                  @update:selected="selectedTreeNode=target"
                >
                  <template v-slot:default-header="prop">
                    <tree-node
                      :note="prop.node.note"
                      :tree="prop.tree"
                    />

                  </template>
                </q-tree>
              </q-tab-panel>
            </template>

          </q-tab-panels>

        </q-drawer>
      </template>

      <template v-slot:after>

        <q-page-container style="padding-right: 0">
          <router-view />
        </q-page-container>
      </template>
    </q-splitter>
  </q-layout>
</template>

<script>

import { mapState } from 'vuex'
import TreeNode from 'components/TreeNode.vue'

export default {
  name: 'MainLayout',

  components: {
    TreeNode
  },

  computed: {
    ...mapState('notes', [
      'notes',
      'trees',
      'flattenTrees'
    ]),
    drawerWidth () {
      return this.splitterModel + 1
    },
    splitterClass () {
      return !this.leftDrawerOpen ? 'splitt' : ''
    },
    compPadding () {
      return this.leftDrawerOpen ? { paddingLeft: '0px' } : ''
    }
  },
  methods: {
    onChange (v) {
      this.leftDrawerOpen = v > 0
    },
    onTreeClicked (v) {

      this.$store.commit('notes/setFocuse', val);
    },
    newNote () {
      console.log(this.selectedTreeNode)
      let parent = this.selectedTreeNode != null ? this.selectedTreeNode : -1;
      this.$store.commit("notes/newNote", { title: "new note", tree: this.tab, parent: parent })
      this.$router.push({ name: 'noteView', params: { tree: this.tab, note: this.$store.state.notes.lastCreatedNote } })
    },
    newTree () {
      this.$store.commit("notes/newTree", "new tree")
      this.$router.push({ name: 'noteView', params: { tree: this.$store.state.notes.lastCreatedNote, note: this.$store.state.notes.lastCreatedNote } })
      this.tab = this.$store.state.notes.lastCreatedNote
    },
    deleteNote (tree = null, note = null) {
      let parent = this.$store.state.notes.flattenTrees[tree][note].parent
      this.$store.commit('notes/deleteNote', note)
      this.$router.push({ name: 'noteView', params: { tree: tree, note: parent } })
    },
    keypress (e) {
      console.log(e)
    }
  },
  watch: {
    $route (to, from) {
      this.tab = parseInt(this.$route.params.tree)
      this.selectedTreeNode = parseInt(this.$route.params.note)
    }
  },
  mounted () {
    this.tab = parseInt(this.$route.params.tree)
    this.selectedTreeNode = parseInt(this.$route.params.note)
  },

  data () {
    return {
      tab: parseInt(this.$route.params.tree),
      selectedTreeNode: parseInt(this.$route.params.note),
      booleanTest: false,
      drawerLeft: true,
      drawerRight: false,
      splitterModel: 200,
      leftDrawerOpen: false,

    }
  }
}
</script>

<style lang="sass">
.splitt
  .q-splitter__before
    transition: width 0.2s ease-out
    width: 0px !important
</style>