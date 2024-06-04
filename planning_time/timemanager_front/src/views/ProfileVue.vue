<template>
  <div class="profile">
    <div class="d-flex flex-row">
      <h2 class="col">Profile</h2>
      <BButton @click="profileModal = !profileModal">Edit my profile</BButton>
    </div>

    <div class="col">
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-sm-3">
              <p class="mb-0">Username</p>
            </div>
            <div class="col-sm-9">
              <p class="text-muted mb-0">{{ username }}</p>
            </div>
          </div>
          <hr />

          <div class="row">
            <div class="col-sm-3">
              <p class="mb-0">Email</p>
            </div>
            <div class="col-sm-9">
              <p class="text-muted mb-0">{{ email }}</p>
            </div>
          </div>
          <hr />

          <div class="row">
            <div class="col-sm-3">
              <p class="mb-0">Role</p>
            </div>
            <div class="col-sm-9">
              <p class="text-muted mb-0">{{ role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="account-deletion">
      <h2>Remove my account</h2>
      <p>If you want to remove your account, you can do it here.</p>
      <BButton variant="danger" @click="removeModal = true">Delete my account</BButton>
    </div>
  </div>

  <!-- Edit profil modal -->
  <BModal
    v-if="user"
    v-on:hidden="profileModalHide"
    v-model="profileModal"
    @ok.prevent="handleUpdateUser"
    title="Edit your profile"
  >
    <form name="edit-form">
      <div class="form-content">
        <BAlert v-if="errors.length" :model-value="true" variant="danger">
          <p v-for="error in errors" :key="error">{{ error }}</p>
        </BAlert>
        <div class="form-slot">
          <label for="email-edit">Email</label>
          <input type="email" name="email-edit" id="email-edit" v-model="user.email" />
        </div>
        <div class="form-slot">
          <label for="username-edit">Username</label>
          <input type="text" name="username-edit" id="username-edit" v-model="user.username" />
        </div>
        <div class="form-slot">
          <label for="role-edit">Password</label>
          <input type="password" name="password-edit" id="password-edit" v-model="newPassword" />
        </div>
        <div class="form-slot">
          <label for="role-edit">New Password</label>
          <input
            type="password"
            name="new-password-edit"
            id="new-password-edit"
            v-model="newPasswordConfirm"
          />
        </div>
      </div>
    </form>
  </BModal>

  <!-- Remove my account modal with password confirmation -->
  <BModal
    v-model="removeModal"
    title="Delete my account"
    @ok="removeAccount"
    ok-variant="danger"
    ok-title="Delete"
  >
    <p>Are you sure you want to delete your account ?</p>
  </BModal>
</template>

<script setup lang="ts">
import api from '../scripts/api'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import type { User } from '@/models/user.model'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const { username, email, role } = storeToRefs(userStore)

const user = ref<User>(userStore.getUser())
const profileModal = ref<boolean>(false)
const removeModal = ref<boolean>(false)

const newPassword = ref<string>('')
const newPasswordConfirm = ref<string>('')

const errors = ref<string[]>([])

const handleUpdateUser = async () => {
  if (!user.value) return
  const response = await api.updateProfile(
    user.value.username,
    user.value.email,
    newPassword.value,
    newPasswordConfirm.value
  )

  errors.value = []

  const responseData = response.data
  if (response.status === 200) {
    userStore.setUser(responseData.data)
    profileModal.value = false
  } else {
    responseData.errors.forEach((error: string) => {
      errors.value.push(error)
    })
  }
}

const profileModalHide = () => {
  newPassword.value = ''
  newPasswordConfirm.value = ''
  user.value = userStore.getUser()
  errors.value = []
}

const removeAccount = async () => {
  const response = await api.removeMyAccount()
  if (response.status === 204) {
    router.push({ name: 'Logout' })
  }
}
</script>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-content {
  margin: 1rem;
  flex-direction: column;
  display: flex;
}

.form-slot {
  margin: 10px;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: space-between;
}

.account-deletion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
