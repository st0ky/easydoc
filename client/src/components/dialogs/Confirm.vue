<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin"
      :class="$q.dark.isActive ? 'elev-24dp' : ''"
    >
      <q-card-section class="row items-center">
        <q-avatar icon="warning" />

        <q-item-label>{{ message }}</q-item-label>
      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn ref="ok" color="primary" label="OK" flat @click="onOKClick" />
        <q-btn color="primary" label="Cancel" flat @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: [
    "message"
    // ...your custom props
  ],

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
      this.$nextTick(() => {
        this.$refs.ok.$el.focus();
      });
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("hide");
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit("ok");
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.$emit("cancel");
      this.hide();
    }
  }
};
</script>
