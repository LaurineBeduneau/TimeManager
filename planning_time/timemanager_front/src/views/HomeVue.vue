<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const { id, username } = storeToRefs(useUserStore())
</script>

<template>
  <div v-if="id">
    <h1>Hello {{ username }}</h1>
    <div>
      <p>Nombre d'heures effectuées dans la semaine</p>
      <WorkingWeekChart :userId="id" />
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
</style>
