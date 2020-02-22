<template>
  <div>
    <q-card
      flat
      bordered
      class="my-card bg-grey-1"
    >
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col-start-1">
            <div class="text-h6"> {{ edit_mode ? edited_note.title : note.title }} </div>
          </div>

          <div class="col-auto">
            <q-chip
              size="sm"
              color="primary"
              text-color="white"
              v-for="(tag, idx) in edit_mode ? edited_note.tags : note.tags"
              :key="idx"
            > {{tag}} </q-chip>
          </div>

          <div class="col-end">
            <q-btn
              color="grey-7"
              round
              flat
              icon="edit"
              v-if="!edit_mode"
              @click="enter_edit"
            />
            <q-btn
              color="grey-7"
              round
              flat
              icon="save"
              v-if="edit_mode"
            />
            <q-btn
              color="grey-7"
              round
              flat
              icon="delete"
            />
          </div>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section> {{ edit_mode ? edited_note.content : note.content }} </q-card-section>

      <q-separator v-if="note.links" />
      <q-card-actions vertical>
        <q-btn
          flat
          v-for="(link, idx) in edit_mode ? edited_note.links : note.links"
          :key="idx"
        > {{link}} </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'NoteCard',
  props: ['note'],
  data () {
    return {
      edit_mode: false,
      edited_note: {
        title: 'note.title.copy()asd',
        content: 'note.content.copy()ad',
        tags: [],
        links: []
      },
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    }
  },
  computed: {
  },
  methods: {
    enter_edit () {
      this.edit_mode = true
      this.edited_note = {
        title: 'this.note.title',
        content: 'this.note.content',
        tags: this.note.tags.slice(),
        links: this.note.links.slice()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 500px
</style>
