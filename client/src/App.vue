<template>
  <div id="app">
    <main>
      <side-bar/>
      <div class="content">
        <div id="nav">
          <router-link to="/">Home</router-link> |
          <router-link to="/about">About</router-link>
        </div>
        <router-view/>
      </div>
    </main>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';

export default {
  name: 'App',
  components: {
    SideBar,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

 main {
    display: flex;
    margin-left: auto;
    margin-right: auto;
  }
  aside {
    flex: 1 0 30%;
    /* height: 100%; */
    overflow-y: auto;
    width: 30%;
    padding: 50px 30px;
    box-sizing: border-box;
    border-right: 1px solid #42b983;
  }
  .content {
    flex: 1 1 70%;
    height: 100%;
  }


</style>
