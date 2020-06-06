<template>
  <q-layout view="Lhh Lpr lff" :class="$q.dark.isActive ? 'elev-00dp text-white' : ''">
    <q-header elevated :class="$q.dark.isActive ? 'elev-04dp' : ''">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        >
          <q-tooltip>Collapse / Exapnd drawer</q-tooltip>
        </q-btn>

        <router-link :to="{ path: '/' }" tag="div" class="cursor-pointer">
          <q-toolbar-title shrink>EasyDoc</q-toolbar-title>
        </router-link>
        <q-toolbar-title />
        <search ref="search" hint="Type '/' to focus here..." />
        <q-btn flat dense round icon="more_vert" aria-label="Menu">
          <q-menu dir="ltr">
            <q-list style="min-width: 160px">
              <q-item clickable v-close-popup @click="$router.go(-1)">
                <q-item-section>Go Back (Esc)</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$router.go(1)">
                <q-item-section>Go Forward (CTRL + Enter)</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="newFileTree">
                <q-item-section>New File Tree</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="newTree">
                <q-item-section>New tree</q-item-section>
              </q-item>
              <q-item clickable @click="newNote" v-close-popup>
                <q-item-section>New note (Insert)</q-item-section>
              </q-item>
              <q-item>
                <q-toggle v-model="$q.dark.isActive" label="Dark mode" left-label v-close-popup />
              </q-item>
              <q-item clickable @click="logOut" v-close-popup>
                <q-item-section>Log out</q-item-section>
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
      :before-class="splitterClass"
      after-class="noscroll"
      @input="onChange"
    >
      <template v-slot:before>
        <q-drawer
          v-model="leftDrawerOpen"
          show-if-above
          bordered
          :width="drawerWidth"
          :breakpoint="0"
          content-class="noscroll column"
        >
          <q-tabs
            v-model="tab"
            elevated
            :class="$q.dark.isActive ? 'elev-16dp' : 'bg-primary text-white'"
            class="col-auto"
          >
            <q-btn-dropdown auto-close flat ref="tabs">
              <q-list>
                <template v-for="(v, tree) in trees">
                  <q-item :key="tree" clickable @click="tab = parseInt(tree)">
                    <q-item-section>
                      {{
                      notes[parseInt(tree)].title
                      }}
                    </q-item-section>
                  </q-item>
                </template>
                <template v-for="(v, tree) in fileTrees">
                  <q-item :key="tree" clickable @click="tab = parseInt(tree)">
                    <q-item-section>Files: {{ notes[parseInt(tree)].title }}</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-btn-dropdown>
            <q-tab v-if="tab !== undefined && notes[tab]" :name="tab" :label="notes[tab].title" />
            <q-tab
              v-if="tab === undefined || !notes[tab]"
              :name="undefined"
              label="Select Tab"
              @click="$refs.tabs.show()"
            />
          </q-tabs>
          <q-separator />

          <q-tab-panels v-model="tab" keep-alive class="col row items-stretch">
            <template v-for="(v, tree) in trees">
              <q-tab-panel
                :key="tree"
                :name="parseInt(tree)"
                class="col-12 q-pa-xs row items-stretch"
              >
                <note-tree class="col-12" :tree="parseInt(tree)" />
              </q-tab-panel>
            </template>

            <template v-for="(v, tree) in fileTrees">
              <q-tab-panel :key="tree" :name="parseInt(tree)" class="col-12">
                <file-tree :tree="parseInt(tree)" />
              </q-tab-panel>
            </template>
          </q-tab-panels>
        </q-drawer>
      </template>

      <template v-slot:after>
        <q-scroll-area style="height: calc(100vh - 0px)">
          <q-page-container style="padding-right: 0">
            <router-view />
          </q-page-container>
        </q-scroll-area>
      </template>
    </q-splitter>
  </q-layout>
</template>

<script>
import { mapState } from "vuex";
import FileExplorer from "components/dialogs/FileExplorer.vue";
import NoteTree from "components/NoteTree.vue";
import FileTree from "components/FileTree.vue";
import Search from "components/Search.vue";

export default {
  name: "MainLayout",

  components: {
    NoteTree,
    FileTree,
    Search
  },

  computed: {
    ...mapState("notes", ["notes", "trees"]),
    ...mapState("socket", ["fileTrees", "user"]),
    drawerWidth() {
      return this.splitterModel + 1;
    },
    splitterClass() {
      return !this.leftDrawerOpen ? "splitt" : "";
    },
    compPadding() {
      return this.leftDrawerOpen ? { paddingLeft: "0px" } : "";
    },
    treeFromParams() {
      return parseInt(this.$route.params.tree);
    }
  },
  methods: {
    onChange(v) {
      this.leftDrawerOpen = v > 0;
    },
    logOut() {
      this.$socket.emit("logout", this.user);
      this.$nextTick(() => {
        this.$router.replace({
          path: "/login",
          query: { from: this.$route.fullPath }
        });
      });
    },
    newNote() {
      this.sockets.subscribe("new note ack", noteId => {
        let tree =
          this.$route.params.tree !== undefined
            ? parseInt(this.$route.params.tree)
            : this.tab;
        if (this.$route.params.note !== undefined && tree !== undefined) {
          this.$socket.emit("move note", {
            noteId: noteId,
            treeId: tree,
            parentId: parseInt(this.$route.params.note)
          });
        }
        this.$router.push({
          name: "noteView",
          params: { tree: tree, note: noteId },
          query: { edit: true }
        });
        this.sockets.unsubscribe("new note ack");
      });
      this.$socket.emit("new note", { title: "new note" });
    },
    newTree() {
      this.sockets.subscribe("new tree ack", noteId => {
        this.tab = noteId;
        this.$router.push({
          name: "noteView",
          params: { tree: noteId, note: noteId },
          query: { edit: true }
        });
        this.sockets.unsubscribe("new tree ack");
      });
      this.$socket.emit("new tree", "new tree");
    },
    newFileTree() {
      this.$q
        .dialog({
          component: FileExplorer,
          parent: this
        })
        .onOk(path => {
          console.log(path);
          this.$socket.emit("new file tree", path);
        });
    },
    keyListener(e) {
      if (e.key === "Escape") {
        this.$router.go(-1);
        e.preventDefault();
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        this.$router.go(1);
        e.preventDefault();
      }
      if (e.code === "Slash") {
        this.$refs.search.focus();
        e.preventDefault();
      }
      if (e.code === "Insert") {
        this.newNote();
        e.preventDefault();
      }
    }
  },
  watch: {
    treeFromParams(to, from) {
      if (to !== undefined && !isNaN(to)) {
        this.tab = to;
      }
    }
  },
  mounted() {
    let to = parseInt(this.$route.params.tree);
    if (to !== undefined && !isNaN(to)) {
      this.tab = to;
    }
  },
  created() {
    document.addEventListener("keyup", this.keyListener);
  },
  destroyed() {
    document.removeEventListener("keyup", this.keyListener);
  },

  data() {
    return {
      tab: undefined,
      booleanTest: false,
      drawerLeft: true,
      drawerRight: false,
      splitterModel: 200,
      leftDrawerOpen: false
    };
  }
};
</script>

<style lang="sass">
.q-splitter__before.splitt
  transition: width 0.2s ease-out
  width: 0px !important

.noscroll
  overflow: hidden
</style>
