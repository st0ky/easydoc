<template>
  <div>
    <v-app-bar app color="blue-grey" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Easydoc</v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <side-tree/>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="left" fixed temporary />

    <v-content>
      <v-container class="fill-height" fluid>
        <v-row justify="center" align="center">
          <v-col class="shrink">
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn :href="source" icon large target="_blank" v-on="on">
                  <v-icon large>mdi-code-tags</v-icon>
                </v-btn>
              </template>
              <span>Source</span>
            </v-tooltip>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  large
                  href="https://codepen.io/johnjleider/pen/QewYYx"
                  target="_blank"
                  v-on="on"
                >
                  <v-icon large>mdi-codepen</v-icon>
                </v-btn>
              </template>
              <span>Codepen</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-navigation-drawer v-model="right" fixed right temporary />

    <v-footer app color="blue-grey" class="white--text">
      <span>Vuetify</span>
      <v-spacer />
      <span>&copy; 2019</span>
    </v-footer>
  </div>
</template>

<script>
import SideTree from "./SideTree";

export default {
  components: {
    SideTree,
  },
  props: {
    source: String
  },
  data: () => ({
    drawer: null,
    drawerRight: null,
    right: false,
    left: false
  })
};
</script>