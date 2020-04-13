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

        <router-link
          :to="{path: '/'}"
          tag="div"
          class="cursor-pointer"
        >
          <q-toolbar-title shrink>
            EasyDoc
          </q-toolbar-title>
        </router-link>
        <q-toolbar-title />
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
                @click="newFileTree"
              >
                <q-item-section>New File Tree</q-item-section>
              </q-item>
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
                  v-close-popup
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
          :width="drawerWidth"
          :breakpoint="0"
        >
          <q-tabs
            v-model="tab"
            elevated
            :class="$q.dark.isActive ? '' : 'bg-primary text-white'"
          >
            <q-btn-dropdown
              auto-close
              flat
            >
              <q-list>
                <template v-for="(v, tree) in trees">
                  <q-item
                    :key="tree"
                    clickable
                    @click="tab = parseInt(tree)"
                  >
                    <q-item-section> {{notes[parseInt(tree)].title}} </q-item-section>
                  </q-item>
                </template>
                <template v-for="(v, tree) in fileTrees">
                  <q-item
                    :key="tree"
                    clickable
                    @click="tab = parseInt(tree)"
                  >
                    <q-item-section>Files: {{notes[parseInt(tree)].title}} </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-btn-dropdown>
            <q-tab
              v-if="tab !== undefined"
              :name="tab"
              :label="notes[tab].title"
            />
            <q-tab
              v-if="tab === undefined"
              :name="undefined"
              label="Select Tab"
            />

          </q-tabs>
          <q-separator />
          <q-tab-panels
            v-model="tab"
            keep-alive
          >
            <template v-for="(v, tree) in trees">
              <q-tab-panel
                :key="tree"
                :name="parseInt(tree)"
                class="q-pa-xs"
              >
                <note-tree :tree="parseInt(tree)" />
              </q-tab-panel>
            </template>

            <template v-for="(v, tree) in fileTrees">
              <q-tab-panel
                :key="tree"
                :name="parseInt(tree)"
              >
                <file-tree :tree="parseInt(tree)" />
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
import FileExplorer from 'components/dialogs/FileExplorer.vue'
import NoteTree from 'components/NoteTree.vue'
import FileTree from 'components/FileTree.vue'

export default {
  name: 'MainLayout',

  components: {
    NoteTree,
    FileTree
  },

  computed: {
    ...mapState('notes', [
      'notes',
      'trees'
    ]),
    ...mapState('socket', [
      'fileTrees'
    ]),
    drawerWidth () {
      return this.splitterModel + 1
    },
    splitterClass () {
      return !this.leftDrawerOpen ? 'splitt' : ''
    },
    compPadding () {
      return this.leftDrawerOpen ? { paddingLeft: '0px' } : ''
    },
    treeFromParams () {
      return parseInt(this.$route.params.tree)
    }
  },
  methods: {
    onChange (v) {
      this.leftDrawerOpen = v > 0
    },
    newNote () {
      this.sockets.subscribe("new note ack", (noteId) => {
        this.$router.push({ name: 'noteView', params: { tree: this.tab, note: noteId }, query: { edit: true } })
        this.sockets.unsubscribe("new note ack")

      })
      this.$socket.emit("new note", { title: "new note" })
    },
    newTree () {
      this.sockets.subscribe("new tree ack", (noteId) => {
        this.tab = noteId
        this.$router.push({ name: 'noteView', params: { tree: noteId, note: noteId }, query: { edit: true } })
        this.sockets.unsubscribe("new tree ack")

      })
      this.$socket.emit("new tree", "new tree")
    },
    newFileTree () {
      this.$q.dialog({
        component: FileExplorer,
        parent: this,
      }).onOk((path) => {
        console.log(path)
        this.$socket.emit('new file tree', path)
      })

    }
  },
  watch: {
    treeFromParams (to, from) {
      if (to !== undefined && !isNaN(to)) {
        this.tab = to
      }
    }
  },
  mounted () {
    let to = parseInt(this.$route.params.tree)
    if (to !== undefined && !isNaN(to)) {
      this.tab = to
    }
  },

  data () {
    return {
      tab: undefined,
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