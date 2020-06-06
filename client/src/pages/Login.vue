<template>
  <div class="fixed-center text-center">
    <q-card class="q-dialog-plugin" :class="$q.dark.isActive ? 'elev-24dp' : ''">
      <q-card-section>
        <q-tabs v-model="tab">
          <q-tab name="login" label="Login" />
          <q-tab name="add user" label="Add User" />
        </q-tabs>
      </q-card-section>
      <q-card-section>
        <div class="text-h4 q-mb-md">{{ tab === "login" ? "Login" : "Add User" }}</div>
        <q-input
          ref="input"
          outlined
          placeholder="Username"
          v-model="user"
          dir="ltr"
          @keyup.enter.stop="tab === 'login' ? login() : addUser()"
          :rules="[val => !!val || 'Field is required']"
        />
      </q-card-section>
      <q-card-actions vertical>
        <q-btn
          color="primary"
          :label="tab === 'login' ? 'Login' : 'Add User'"
          text-color="on-primary"
          @click="tab === 'login' ? login() : addUser()"
          :disable="
            !$refs.input || !$refs.input.isDirty || $refs.input.innerError
          "
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      tab: "login",
      user: ""
    };
  },
  methods: {
    login() {
      this.$socket.emit("login", this.user);
    },
    addUser() {
      this.$socket.emit("add user", this.user);
    }
  },
  sockets: {
    LOGIN_UPDATE: function({ status, user }) {
      if (status) {
        this.$nextTick(() => {
          if (this.$route.query.from) {
            this.$router.replace({ path: this.$route.query.from });
          } else {
            this.$router.replace({ path: "/" });
          }
        });
      }
    },
    LOGIN_FAIL: function({ user, reason }) {
      this.$q.notify({
        message: reason,
        position: "top",
        type: "negative"
      });
    },
    ADD_USER_FAIL: function({ user, reason }) {
      this.$q.notify({
        message: reason,
        position: "top",
        type: "negative"
      });
    },
    ADD_USER_OK: function({ user }) {
      this.$q.notify({
        message: `user '${user}' added`,
        position: "top",
        type: "positive"
      });
    }
  }
};
</script>
