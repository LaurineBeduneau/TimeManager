<template>
  <h1>Clock Manager</h1>
  <div class="clock">
    <div class="timer">
      <p class="info" v-if="started">La période de travail est en cours.</p>
      <p class="info" v-else>La période de travail n'est pas en cours.</p>
      <p>{{ time }}</p>
      <p class="sub">
        <span v-if="started">Started at {{ format(new Date(startTime), 'yyyy-MM-dd HH:mm') }}</span>
        <span v-else>Not started</span>
      </p>
    </div>
    <div v-if="started">
      <BButton @click="toggleClock">Stop</BButton>
    </div>
    <div v-else>
      <BButton @click="toggleClock">Start</BButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useClockStore } from '@/stores/clock'
import { format } from '@/scripts/utils'

const { toggleClock } = useClockStore()
const { started, startTime } = storeToRefs(useClockStore())
const time = ref('00:00:00')
const interval = ref<NodeJS.Timeout>()

const updateTimer = () => {
  if (!started.value) return
  const currentTime = new Date()
  const date = new Date(startTime.value)
  // Time elapsed since start
  time.value = new Date(currentTime.getTime() - date.getTime()).toISOString().substr(11, 8)
}

onMounted(() => {
  interval.value = setInterval(updateTimer, 1000)
  updateTimer()
})

onUnmounted(() => {
  clearInterval(interval.value)
})

const clockColor = ref('#fff')

watchEffect(() => {
  if (started.value) {
    clockColor.value = '#caf7b7'
  } else {
    clockColor.value = '#fff'
  }
})
</script>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.clock {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timer {
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: v-bind(clockColor);
  color: #333;
}

.info {
  font-size: 1.1rem;
  color: #333;
}

.sub {
  font-size: 1rem;
  font-weight: normal;
  color: #666;
}
</style>
