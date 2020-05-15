<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  mounted() {
    this.$q.dark.isActive = true;
  },
  watch: {
    "$q.dark.isActive"(val) {
      if (val) {
        let els = document.getElementsByClassName("body--light");
        for (let el of els) {
          el.classList.remove("body--light");
          el.classList.add("body--dark");
        }
      } else {
        let els = document.getElementsByClassName("body--dark");
        for (let el of els) {
          el.classList.remove("body--dark");
          el.classList.add("body--light");
        }
      }
    }
  }
};
</script>

<style lang="sass">
.body--dark
  --q-color-primary: #81d4fa
  --q-color-secondary: #ffcc80
  --q-color-on-primary: #000000
  --q-color-on-secondary: #000000
  --q-color-negative: #CF6679

  .text-on-primary
    color: #000000
  .bg-on-primary
    background: #000000

  .text-on-secondary
    color: #000000
  .bg-on-secondary
    background: #000000

  .q-card
    a:link
      color: var(--q-color-primary)
    a:visited
      color: var(--q-color-secondary)

.body--light
  --q-color-primary: #1976D2
  --q-color-secondary: #26A69A
  --q-color-on-primary: #ffffff
  --q-color-on-secondary: #000000

  .text-on-primary
    color: #ffffff
  .bg-on-primary
    background: #ffffff

  .text-on-secondary
    color: #000000
  .bg-on-secondary
    background: #000000

.elev-00dp
  background: #121212 //   0%

.elev-01dp
  background: #1E1E1E //   5%

.elev-02dp
  background: #232323 //   7%

.elev-03dp
  background: #252525 //   8%

.elev-04dp
  background: #272727 //   9%

.elev-06dp
  background: #2C2C2C //   11%

.elev-08dp
  background: #2F2F2F //   12%

.elev-12dp
  background: #333333 //   14%

.elev-16dp
  background: #353535 //   15%

.elev-24dp
  background: #383838 //   16%
</style>
