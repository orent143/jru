<template>
  <div id="app">
    <router-view />  
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

// 🚀 Redirect to the last visited page on refresh
onMounted(() => {
  const lastPage = localStorage.getItem('lastPage');
  if (lastPage) {
    router.replace(lastPage);
  }
});
</script>

<style scoped>
/* Add any scoped styles here */
</style>
