<template>
  <q-page class="flex flex-center">
    <note-card
      v-if="focusedNote"
      :note="focusedNote"
    />
  </q-page>
</template>

<script>
import NoteCard from 'components/NoteCard.vue'

export default {
  name: 'PageIndex',
  components: { NoteCard },
  computed: {
    focusedNote: {
      get () {
        if (!this.$store.state.notes.focus) {
          return false
        }
        return this.$store.state.notes.notes[this.$store.state.notes.focus]
      }
    },
    notes: {
      get () {
        return this.$store.state.notes.notes
      }
    }
  },
  data () {
    return {
      note: {
        title: 'שלום ךגוךכם. this is my first כרטיס',
        content: `מי שטוב לו ושמח הוא שיר משחק עברי שהוא תרגום-עיבוד מאת דתיה בן דור לשיר הילדים האמריקאי "If You're Happy and You Know It".

השיר האמריקאי התפרסם בשלהי שנות ה-50, בלחן אמריקאי עממי. על בסיס השיר כתבה בן דור את הגרסה העברית, שבוצעה ב-1977 בתוכנית הטלוויזיה "מה פתאום?" של הטלוויזיה החינוכית הישראלית בהנחייתה של נירה רבינוביץ' ובשיתוף הבובה קישקשתא (בפרק 18: "יום הולדת לקישקשתא", שהיה בסימן חגיגה). בעקבות התוכנית הקליטה רבינוביץ את התקליט "שירי משחק" שבו הופיע השיר. השיר בוצע גם בקלטת-הווידאו לילדים מי שטוב לו ושמח כף ימחא: שירי משחק (1994), שכוללת שירים ולחנים מאת דתיה בן דור, ובקלטת-וידאו נוספת לילדים, שירים קטנים למשחק ולימי-הולדת (1991), ובשיר השונה "אם נעים וגם שמח" בסדרה "החברים של ברני" או "יש בלונים באוויר" בקלטת הילדים "קסם בג'ימבורי 2", והשיר בוצע גם בפרסומת לחטיף הבוטנים "שוש".`,
        tags: ['hello', 'שלום', 'heyyyyyy :)'],
        links: ['https://he.wikipedia.org/wiki', 'https://he.wikipedia.org/wiki', 'https://he.wikipedia.org/wiki']
      }
    }
  }
}
</script>
