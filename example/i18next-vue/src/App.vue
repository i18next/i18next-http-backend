<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <TranslationShowCase />
</template>

<script>
import { i18nextPromise } from './i18n.js'
import TranslationShowCase from './components/TranslationShowCase.vue'

export default {
  name: 'App',
  components: {
    TranslationShowCase
  },
  // used in combination with Suspense.
  // useful when translations are not in-memory...
  async setup() {
    await i18nextPromise;
    return {};
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
