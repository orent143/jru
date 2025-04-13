<template>
  <div id="app">
    <router-view />  
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
  const lastPage = localStorage.getItem('lastPage');
  if (lastPage) {
    router.replace(lastPage);
  }
});
</script>

<style scoped>
</style>
