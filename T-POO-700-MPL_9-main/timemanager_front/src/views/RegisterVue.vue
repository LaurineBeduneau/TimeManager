<template>
  <div v-if="!logged">
    <h3>TimeManager</h3>
    <h6>Register</h6>
    <RegisterComponent @success="success" />
    <RouterLink to="/login">Log in</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import RegisterComponent from '@/components/authentication/RegisterComponent.vue'

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
