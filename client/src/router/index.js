import Vue from "vue";
import VueRouter from "vue-router";

import routes from "./routes";

Vue.use(VueRouter);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function({ store } /* { store, ssrContext } */) {
  const Router = new VueRouter({
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (
        to.name == from.name &&
        (from.name == "code" ||
          (from.name == "noteCode" && to.params.note == from.params.note))
      )
        return { x: 0, y: window.scrollY };
      return { x: 0, y: 0 };
    },

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  });

  Router.beforeEach((to, from, next) => {
    console.log(to);
    if (to.meta.guest) {
      next();
      return;
    }
    if (!store.state.socket.loginStatus) {
      next({ path: "/login", query: { from: to.fullPath } });
      return;
    }
    next();
  });

  return Router;
}
