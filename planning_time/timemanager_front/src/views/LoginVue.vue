<template>
  <div v-if="!logged">
    <h3>TimeManager</h3>
    <h6>Log in</h6>
    <LoginComponent @success="success" />
    <RouterLink to="/register">Register</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { logged } = storeToRefs(useUserStore())

const router = useRouter()

const success = async () => {
  await userStore.fetchUser()
  router.push({ name: 'Home' })
}
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

div h6 {
  color: grey;
}
</style>
