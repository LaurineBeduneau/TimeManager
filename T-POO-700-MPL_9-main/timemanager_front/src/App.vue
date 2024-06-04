<script setup lang="ts">
import LoggedinLayout from './layouts/LoggedinLayout.vue'
import LoggedoutLayout from './layouts/LoggedoutLayout.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from './stores/user'

const { logged } = storeToRefs(useUserStore())
</script>

<template>
  <Transition name="fade">
    <LoggedinLayout v-if="logged">
      <RouterView />
    </LoggedinLayout>

    <LoggedoutLayout v-else>
      <RouterView />
    </LoggedoutLayout>
  </Transition>
</template>

<style>
p {
  margin: 0 !important;
}
</style>
