<template>
  <form name="register-form" @submit.prevent="register">
    <div class="form-content">
      <BAlert v-if="errors.length" :model-value="true" variant="danger">
        <p v-for="error in errors" :key="error">{{ error }}</p>
      </BAlert>
      <div class="form-slot">
        <label for="username-reg">Username</label>
        <input type="text" name="username-reg" class="form-field" v-model="username" />
      </div>
      <div class="form-slot">
        <label for="email-reg">Email</label>
        <input type="email" name="email-log" class="form-field" v-model="email" />
      </div>
      <div class="form-slot">
        <label for="password-reg">Password</label>
        <input type="password" name="password-reg" class="form-field" v-model="password" />
      </div>
      <div class="form-slot">
        <label for="confirm-password-reg">Confirm password</label>
        <input
          type="password"
          name="confirm-password-reg"
          class="form-field"
          v-model="passwordConfirm"
        />
      </div>

      <div class="form-slot">
        <button type="submit" class="btn btn-primary" :disabled="submitDisabled">Register</button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../../scripts/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const emit = defineEmits(['success'])

const username = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const passwordConfirm = ref<string>('')
const errors = ref<string[]>([])
const submitDisabled = ref<boolean>(false)

async function register() {
  errors.value = []
  submitDisabled.value = true

  if (
    email.value === '' ||
    password.value === '' ||
    username.value === '' ||
    passwordConfirm.value === ''
  ) {
    errors.value.push('Please fill all the fields')
    submitDisabled.value = false
    return
  }

  if (password.value !== passwordConfirm.value) {
    errors.value.push('Passwords do not match')
    submitDisabled.value = false
    return
  }

  const response = await api.register(
    email.value,
    username.value,
    password.value,
    passwordConfirm.value
  )
  const responseData = response.data
    
  if (response.status === 200) {
    userStore.setToken(responseData.jwt)
    emit('success')
  } else {
    responseData.errors.forEach((error: string) => {
      errors.value.push(error)
    })
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
