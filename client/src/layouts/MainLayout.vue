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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-tabs
        v-model="tab"
        inline-label
        class="bg-primary text-white shadow-2"
      >
        <q-tab
          v-for="tree of myTrees"
          :key="tree.name"
          :name="tree.name"
          :label="tree.name"
        />

      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab">
        <template v-for="tree of myTrees">
          <q-tab-panel
            :key="tree.name"
            :name="tree.name"
            keep-alive="true"
          >
            <div class="q-pa-md q-gutter-sm">
              <q-tree
                :nodes="tree.tree"
                node-key="label"
                :expanded.sync="expanded"
              />
            </div>
          </q-tab-panel>
        </template>

      </q-tab-panels>

    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',

  components: {
  },

  computed: {
    myTrees: {
      get () {
        return this.$store.getters['notes/GetTrees']
      }
    }
  }
  ,

  data () {
    return {
      tab: null,
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
      simple1: this.$store.getters['notes/GetTrees'][0],

      leftDrawerOpen: false,

    }
  }
}
</script>
