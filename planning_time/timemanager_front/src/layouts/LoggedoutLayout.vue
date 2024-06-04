<script setup lang="ts">
</script>

<template>
  <main>
    <div class="content">

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
  align-items: center;
}

.wrapper {
  display: flex;
  overflow: scroll;
  height: 100%;
  align-items: center;
}
</style>
