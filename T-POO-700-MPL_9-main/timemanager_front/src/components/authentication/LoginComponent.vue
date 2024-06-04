<template>
  <form name="loggin-form" @submit.prevent="login">
    <div class="form-content">
      <BAlert v-if="errors.length" :model-value="true" variant="danger">
        <p v-for="error in errors" :key="error">{{ error }}</p>
      </BAlert>
      <div class="form-slot">
        <label for="email-log">Email</label>
        <input type="email" name="email-log" class="form-field form-control" v-model="email" />
      </div>
      <div class="form-slot">
        <label for="password-log">Password</label>
        <input
          type="password"
          name="password-log"
          class="form-field form-control"
          v-model="password"
        />
      </div>

      <div class="form-slot">
        <button type="submit" class="btn btn-primary" :disabled="submitDisabled">Login</button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../../scripts/api'
import { useUserStore } from '@/stores/user';

const userStore = useUserStore()
const emit = defineEmits(['success'])

const email = ref<string>('')
const password = ref<string>('')
const errors = ref<string[]>([])
const submitDisabled = ref<boolean>(false)

async function login() {
  errors.value = []
  submitDisabled.value = true

  if (email.value === '' || password.value === '') {
    errors.value.push('Please fill all the fields')
    submitDisabled.value = false
    return
  }

  const response = await api.login(email.value, password.value)
  const responseData = response.data

  if (response.status === 200) {
    userStore.setToken(responseData.jwt)
    emit('success')
  } else {
    errors.value.push('Wrong credentials')
    submitDisabled.value = false
  }
}
</script>

<style scoped>
.form-content {
  margin: 1rem;
  flex-direction: column;
  display: flex;
}

.form-slot {
  margin: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  justify-content: space-between;
}

.form-field {
  height: 2rem;
  width: 100%;
  align-self: center;
  border: 1px solid #e4e4e7;
  border-radius: 0.2rem;
}
</style>
