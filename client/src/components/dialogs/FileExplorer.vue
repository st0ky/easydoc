<template>
  <q-dialog
    ref="dialog"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin">
      <q-card-section class="row items-center">
        <q-avatar icon="las la-file-import" />

        <div class="text-h6">Select folder to import</div>
      </q-card-section>
      <q-card-section>
        <!-- <bdo dir="ltr"> {{ selected ? selected.replace('.//', './') : undefined }} </bdo> -->
        <bdo dir="ltr">
          <q-input
            filled
            v-model="_selected"
            label="Filled"
            :rules="[val => !!tree.getNodeByKey(val) || 'No such folder']"
            @keyup.enter="onOKClick"
            autofocus
          /></bdo>
      </q-card-section>
      <q-card-section>
        <q-tree
          :nodes="lazy"
          ref='tree'
          default-expand-all
          node-key="path"
          node-label="label"
          @lazy-load="onLazyLoad"
          selected-color="primary"
          :selected="selected"
          @update:selected="onselect"
        >
          <template v-slot:default-header="{node}">
            <q-btn
              outline
              no-caps
              dense
              :color="selected && node.path == selected ? 'primary' : ''"
              :label="node.label"
            />
          </template>
        </q-tree>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          ref="ok"
          color="primary"
          label="OK"
          flat
          @click="onOKClick"
          :disable="!valid_select"
        />
        <q-btn
          color="primary"
          label="Cancel"
          flat
          @click="onCancelClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>



export default {
  name: 'FileExplorer',
  components: {},
  data () {
    return {
      lazy: [{ label: 'root', path: '/', children: [], lazy: true }],
      pending: {},
      selected: null,
      tree: null,
      valid_select: false
    }
  },
  computed: {
    _selected: {
      get () {
        return this.selected
      },
      set (v) {
        this.valid_select = false
        this.selected = v
        let splitted = v.split('/')
        for (let i in { ...[...Array(splitted.length)] }) {
          let key = splitted.slice(0, splitted.length - i).join('/')
          if (!this.tree.getNodeByKey(key)) break
          if (!this.tree.isExpanded(key)) {
            this.tree.setExpanded(key, true)
          }
        }

        this.valid_select = !!this.tree.getNodeByKey(v)
      }
    }

  },
  sockets: {
    FS_CHILDREN: function ({ path, children }) {
      if (this.pending[path] !== undefined) {
        this.pending[path](children)
        delete this.pending[path]
      }
    }
  },
  methods: {
    show () {
      this.$refs.dialog.show()
      this.$nextTick(() => {
        this.tree = this.$refs.tree
      })
    },
    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide () {
      this.$refs.dialog.hide()
    },

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick () {
      if (!this.valid_select) return
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok', this.selected)
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick () {
      // we just need to hide dialog
      this.$emit('cancel')
      this.hide()
    },
    onLazyLoad ({ node, key, done, fail }) {
      if (node.children.length) {
        done(node.children)
        return
      }
      this.pending[node.path] = done
      this.$socket.emit("fs get children", node.path)
      setTimeout(fail, 1000)
    },
    onselect (target) {
      console.log(target)
      this._selected = target
    }
  },
  watch: {

  },
  mounted () {
    this.$nextTick(() => {
      this.tree = this.$refs.tree
    })
  }
}
</script>
