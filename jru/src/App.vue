<template>
  <div id="app">
    <router-view />  <!-- Renders the component based on the current route -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'; // Importing the router to programmatically navigate
import { onMounted } from 'vue';

const router = useRouter();

// Redirect to the Welcome page when the app is loaded
onMounted(() => {
  router.push('/');
});
</script>

<style scoped>
/* Add any scoped styles here */
</style>