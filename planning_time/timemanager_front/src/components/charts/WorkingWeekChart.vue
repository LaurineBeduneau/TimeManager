<template>
  <BarChart :chartData="dataChart" />
</template>

<script setup lang="ts">
import { BarChart } from 'vue-chart-3'
import { ref, onMounted, computed, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { isDateInCurrentWeek } from '@/scripts/utils'
import { useUserStore } from '@/stores/user'
import api from '@/scripts/api'
import { storeToRefs } from 'pinia'

type WorkingTime = {
  id: number
  start: Date
  end: Date
}

Chart.register(...registerables)
const data = ref<number[]>([])

const { role } = storeToRefs(useUserStore())
const canManage = ['admin', 'manager'].includes(role.value)

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
})

const getWorkingTimes = async () => {
  const response = canManage
    ? await api.getWorkingTimesManager(props.userId)
    : await api.getWorkingTimes(props.userId)
  const data = response.data.data

  // Get working times for current week
  const workingTimesCurrentWeek = data.filter((workingTime: WorkingTime) => {
    return isDateInCurrentWeek(new Date(workingTime.start))
  })

  const daysHours = [0, 0, 0, 0, 0, 0, 0]
  workingTimesCurrentWeek.forEach((workingTime: WorkingTime) => {
    const day = new Date(workingTime.start).getDay()
    const hours =
      (new Date(workingTime.end).getTime() - new Date(workingTime.start).getTime()) / 1000 / 3600
    daysHours[day] += hours
  })

  return daysHours
}

onMounted(async () => {
  data.value = await getWorkingTimes()
})

watch(
  () => props.userId,
  async () => {
    data.value = await getWorkingTimes()
  }
)

const dataChart = computed(() => ({
  labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
  datasets: [
    {
      label: "Nombre d'heures",
      data: data.value,
      backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED', '#C7E0F4', '#E5F1F9']
    }
  ]
}))
</script>
