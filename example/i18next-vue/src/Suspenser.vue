<template>
  <Suspense>
    <template #default>
      <App />
    </template>
    <template #fallback>
      <span>Loading...</span>
    </template>
  </Suspense>
</template>

<script>
import App from './App.vue'

export default {
  name: 'SuspenserComponent',
  components: {
    App
  }
}
</script>

<style>
</style>
