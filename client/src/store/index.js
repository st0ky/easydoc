import Vue from 'vue'
import Vuex from 'vuex'

import notes from './notes'
import socket from './socket'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      notes,
      socket
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  if (process.env.DEV && module.hot) {
    module.hot.accept(['./notes'], () => {
      const newNotes = require('./notes').default
      Store.hotUpdate({ modules: { notes: newNotes } })
    })
    module.hot.accept(['./socket'], () => {
      const newsocket = require('./socket').default
      Store.hotUpdate({ modules: { socket: newsocket } })
    })
  }

  return Store
}
