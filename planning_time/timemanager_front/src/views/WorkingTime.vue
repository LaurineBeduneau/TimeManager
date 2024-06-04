<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const $route = useRoute()

const userId = ref<string>($route.params.userId as string)
const workingTimeId = ref<string>($route.params.workingTimeId as string)

const additionData = ref<{ start: string; end: string }>({
  start: '',
  end: ''
})

const createWorkingTime = () => {
  // TODO: handle errors
  axios.post(`http://localhost:4000/api/workingtimes/${userId.value}`, {
    workingtime: additionData.value
  })
}

const updateWorkingTime = () => {
  // TODO: handle errors
  axios.put(`http://localhost:4000/api/workingtimes/${workingTimeId.value}`, {
    workingtime: additionData.value
  })
}

const deleteWorkingTime = () => {
  axios.delete(`http://localhost:4000/api/workingtimes/${workingTimeId.value}`).then((response) => {
    if (response.status === 204) goBackToTimes()
    else alert('An error occured') // TODO: handle errors
  })
}

const goBackToTimes = () => {
  router.push(`/workingTimes/${userId.value}`)
}
</script>

<template>
  <div v-if="userId && !workingTimeId" class="creation">
    <div class="title">
      <h1>Create working time</h1>
      <button @click="goBackToTimes">go back to times</button>
    </div>

    <form @submit.prevent="createWorkingTime">
      <div class="form-group">
        <label for="start">Start</label>
        <input type="datetime-local" id="start" name="start" v-model="additionData.start" />
      </div>

      <div class="form-group">
        <label for="end">End</label>
        <input type="datetime-local" id="end" name="end" v-model="additionData.end" />
      </div>

      <button type="submit">Create</button>
    </form>
  </div>

  <div v-if="userId && workingTimeId" class="update">
    <div class="title">
      <h1>Update working time</h1>
      <button @click="goBackToTimes">go back to times</button>
    </div>

    <form @submit.prevent="updateWorkingTime">
      <div class="form-group">
        <label for="start">Start</label>
        <input type="datetime-local" id="start" name="start" v-model="additionData.start" />
      </div>

      <div class="form-group">
        <label for="end">End</label>
        <input type="datetime-local" id="end" name="end" v-model="additionData.end" />
      </div>

      <button type="submit">Update</button>
    </form>

    <button @click="deleteWorkingTime">Delete</button>
  </div>
</template>

<style scoped>
.creation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
