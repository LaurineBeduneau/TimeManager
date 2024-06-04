<script setup lang="ts">
import { ref } from 'vue'

import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useLayoutStore } from '@/stores/layout'

const { logged, username, role } = storeToRefs(useUserStore())
const { toggleNav } = useLayoutStore()

const loginModal = ref<boolean>(false)
const registerModal = ref<boolean>(false)

</script>

<template>
  <div class="header">
    <div class="header-right">
      <BDropdown
        split
        :text="username"
        variant="primary"
        split-variant="outline-primary"
        class="profile-menu"
        split-to="/profile"
        offset="5"
      >
        <BDropdownItem to="/logout" variant="danger">Log out</BDropdownItem>
      </BDropdown>

      <div class="actions">
        <p :class="'action role role-' + role">{{ role }}</p>
      </div>
    </div>
    <div class="header-left">
      <BurgerIcon @click.stop="toggleNav" />
    </div>
  </div>

  <!-- Login Modal -->
  <BModal v-model="loginModal" title="Login" hide-footer>
    <LoginComponent v-on:success="(logged = true), (loginModal = false)" />
  </BModal>

  <!-- Register Modal -->
  <BModal v-model="registerModal" title="Register" hide-footer>
    <RegisterComponent v-on:success="(logged = true), (registerModal = false)" />
  </BModal>
</template>

<style scoped>
.header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: row-reverse;
  gap: 1rem;
  align-items: center;
}

.header .profile {
  width: 2.5rem;
  height: 2.5rem;
  background-color: gray;
  border-radius: 2rem;
}

.header .actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-self: center;
  align-items: center;
}

.header-right {
  display: flex;
  flex-direction: row-reverse;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

@media screen and (min-width: 768px) {
  .header-left {
    display: none;
  }
}

.action {
  margin: 0;
}

.role {
  padding: 0.3rem;
  border-radius: 0.5rem;
  color: white;
}

.role-admin {
  background-color: #dc3545;
}

.role-user {
  background-color: #28a745;
}

.role-manager {
  background-color: #007bff;
}
</style>
