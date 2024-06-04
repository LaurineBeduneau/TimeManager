<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const router = useRouter()

onMounted(() => {
  userStore.$reset()
  router.replace({ name: 'Login' })
})
</script>

<template>
  <div>
    <p>Redirecting...</p>
  </div>
</template>
