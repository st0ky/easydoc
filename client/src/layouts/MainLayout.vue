<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
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
          content-class="bg-grey-1"
          :width="drawerWidth"
          :breakpoint="0"
        >
          <q-tabs
            v-model="tab"
            inline-label
            elevated
            class="bg-primary text-white"
          >
            <q-tab
              v-for="tree of trees"
              :key="tree.note"
              :name="tree.note"
              :label="notes[tree.note].title"
            />

          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab">
            <template v-for="tree of trees">
              <q-tab-panel
                :key="tree.note"
                :name="tree.note"
                keep-alive="true"
              >
                <q-tree
                  :nodes="[tree]"
                  node-key="note"
                  label-key="note"
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

        <q-page-container>
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
    myTrees: {
      get () {
        return this.$store.getters['notes/GetTrees']
      }
    },
    ...mapState('notes', [
      'notes',
      'trees'
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
    }
  },

  data () {
    return {
      tab: null,
      booleanTest: false,
      drawerLeft: true,
      drawerRight: false,
      splitterModel: 200,
      expanded: ['Satisfied customers (with avatar)', 'Good food (with icon)'],
      simple: [
        {
          label: 'Satisfied customers (with avatar)',
          avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          children: [
            {
              label: 'אני כותב בעיברית and in english ביחד',
              icon: 'restaurant_menu',
              children: [
                { label: 'Quality ingredients' },
                { label: 'Good recipe' }
              ]
            },
            {
              label: 'Good service (disabled node with icon)',
              icon: 'room_service',
              disabled: true,
              children: [
                { label: 'Prompt attention' },
                { label: 'Professional waiter' }
              ]
            },
            {
              label: 'Pleasant surroundings (with icon)',
              icon: 'photo',
              children: [
                {
                  label: 'Happy atmosphere (with image)',
                  img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png'
                },
                { label: 'Good table presentation' },
                { label: 'Pleasing decor' }
              ]
            }
          ]
        }
      ],

      leftDrawerOpen: false,

    }
  }
}
</script>

<!-- <style scoped>
.splitt
  .q-splitter__before {
    transition: width 0.2s ease-out,
    width: 0px !important
  }

</style> -->

<style lang="sass">
.splitt
  .q-splitter__before
    transition: width 0.2s ease-out
    width: 0px !important
</style>