<script setup lang="ts">
import NavBar from '../components/NavBar.vue'
import Header from '../components/HeaderVue.vue'
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'

const { toggleNav } = useLayoutStore()
const { navOpen } = storeToRefs(useLayoutStore())
</script>

<template>
  <main>
    <NavBar />

    <div class="over" @click="toggleNav(false)" v-if="navOpen"></div>

    <div class="content">
      <Header></Header>

      <div class="wrapper">
        <slot></slot>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: row;
  background-color: #f4f5f7;
  height: 100vh;
}

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 1rem 1.5rem;
}

.wrapper {
  overflow: scroll;
}

.over {
  position: absolute;
  background-color: rgba(0, 0, 0, 255);
  width: 100%;
  height: 100%;
  opacity: 0.5;
  z-index: 1;
}
</style>
