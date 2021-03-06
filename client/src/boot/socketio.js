// import something here
import VueSocketIO from "vue-socket.io";

export default ({ app, router, Vue, store }) => {
  Vue.use(
    new VueSocketIO({
      debug: false,
      connection: "/socket",
      vuex: {
        store,
        mutationPrefix: "SOCKET_"
      }
    })
  );
};
