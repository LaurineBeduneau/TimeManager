<script lang="ts" setup>
import { ref, onMounted } from 'vue'
// import AddIcon from '../components/icons/AddIcon.vue'
// import UpdateIcon from '../components/icons/UpdateIcon.vue'
import api from '@/scripts/api'
import { tzTime, format, formatDist } from '@/scripts/utils'
import { useUserStore } from '@/stores/user'
import { useTeamStore } from '@/stores/team'
import VueCal from 'vue-cal'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

const userStore = useUserStore()

const { role } = storeToRefs(useUserStore())
const { fetchMembers } = useTeamStore()
const { selectedTeamId, members } = storeToRefs(useTeamStore())

const selectedUserId = ref<number>(userStore.id)

const manageRoles = ['admin', 'manager']
const canManage = manageRoles.includes(role.value)

type WorkingTime = {
  id: number
  start: Date
  end: Date
} & {
  overtime: number
}

type EventType = {
  start: Date
  end: Date
  title: string
  content: string
  class: string
}

const workingTimes = ref<WorkingTime[]>([])
const events = ref<EventType[]>([])
const selectedEvent = ref<WorkingTime>()
const showEvent = ref<boolean>(false)

const totalWorkingTimePerDay = 28800 // 8 hours

const workingHoursPerDays = ref<{ [date: string]: number }>({})

// date is in format yyyy-MM-dd
const getWorkingTimePerDay = (date: string) => {
  const workingTimesPerDay = workingTimes.value.filter((workingTime) => {
    return format(tzTime(new Date(workingTime.start)), 'yyyy-MM-dd') === date
  })

  let workingTimePerDay = 0 // in seconds
  workingTimesPerDay.forEach((workingTime) => {
    workingTimePerDay +=
      (new Date(workingTime.end).getTime() - new Date(workingTime.start).getTime()) / 1000
  })

  return workingTimePerDay
}

const getWorkingTimes = async (userId: number) => {
  events.value = []
  workingHoursPerDays.value = {}

  const response = canManage
    ? await api.getWorkingTimesManager(userId)
    : await api.getWorkingTimes(userId)
  workingTimes.value = response.data['data']
  workingTimes.value.reverse()

  workingTimes.value.forEach((workingTime) => {
    events.value.push({
      start: new Date(workingTime.start),
      end: new Date(workingTime.end),
      title: 'Working time',
      content: formatDist(new Date(workingTime.end), new Date(workingTime.start)),
      class: 'workingtime'
    })

    const day = format(tzTime(new Date(workingTime.start)), 'yyyy-MM-dd')
    if (!workingHoursPerDays.value[day]) {
      workingHoursPerDays.value[day] = getWorkingTimePerDay(day)
    }

    workingTime.overtime = workingHoursPerDays.value[day]
  })
}

const onEventClick = (event: any, e: any) => {
  const filteredItems = workingTimes.value.filter((workingTime) => {
    return (
      format(new Date(workingTime.start), 'yyyy-MM-dd HH:mm') ===
        format(event.start, 'yyyy-MM-dd HH:mm') &&
      format(new Date(workingTime.end), 'yyyy-MM-dd HH:mm') ===
        format(event.end, 'yyyy-MM-dd HH:mm')
    )
  })

  if (filteredItems.length === 0) return

  const selected = filteredItems[0]

  selectedEvent.value = {
    id: event._eid,
    start: new Date(selected.start),
    end: new Date(selected.end),
    overtime: selected.overtime
  } as WorkingTime
  showEvent.value = true

  e.preventDefault()
}

const selectUsername = (event: any) => {
  const userId = event.target.value
  if (!userId) return

  getWorkingTimes(userId)
}

onMounted(() => {
  getWorkingTimes(userStore.id)
  fetchMembers()
})

watch(
  () => selectedTeamId?.value,
  () => {
    getWorkingTimes(userStore.id)
  }
)
</script>

<template>
  <div>
    <div class="title">
      <div class="left_title">
        <h1>Working Times</h1>
      </div>
    </div>

    <div class="description">
      Vous avez
      <code>{{ workingTimes.length === 0 ? 'aucun' : workingTimes.length }}</code> temps de travail
      enregistrés
    </div>

    <div v-if="canManage && selectedTeamId">
      <p>Select user :</p>
      <select v-model="selectedUserId" @change="selectUsername">
        <option value="" selected>No user</option>
        <option v-for="user in members" :key="user.id" :value="user.id">
          {{ user.username }}
        </option>
      </select>
    </div>

    <BTabs>
      <BTab title="Calendar">
        <VueCal
          class="calendar"
          :events="events"
          :on-event-click="onEventClick"
          :selected-date="new Date()"
          active-view="week"
          :disable-views="['years']"
          today-button
        />
      </BTab>
      <BTab title="Heures supplémentaires">
        <div class="list">
          <template v-for="[key, value] in Object.entries(workingHoursPerDays)" :key="key">
            <div class="list_item" v-if="value > totalWorkingTimePerDay">
              <p>{{ key }}</p>
              <p>
                {{ formatDist(new Date(value * 1000), new Date(totalWorkingTimePerDay * 1000)) }} de
                travail en plus
              </p>
            </div>
          </template>
        </div>
      </BTab>
      <BTab title="Graphiques">
        <div>
          <p>Nombre d'heures effectuées dans la semaine</p>
          <WorkingWeekChart :userId="selectedUserId" />
        </div>
      </BTab>
    </BTabs>

    <!-- View selected working time  -->
    <BModal
      v-model="showEvent"
      title="Working time"
      @ok="showEvent = false"
      ok-only
      v-if="selectedEvent"
    >
      <div class="working_time_row">
        <p>Start:</p>
        <p>{{ format(selectedEvent.start, 'yyyy-MM-dd HH:mm') }}</p>
      </div>
      <div class="working_time_row">
        <p>End:</p>
        <p>{{ format(selectedEvent.end, 'yyyy-MM-dd HH:mm') }}</p>
      </div>
      <div class="working_time_row">
        <p>Duration:</p>
        <p>{{ formatDist(new Date(selectedEvent.end), new Date(selectedEvent.start)) }}</p>
      </div>
      <div class="working_time_row" v-if="selectedEvent.overtime > totalWorkingTimePerDay">
        <p>Heures supp. ce jour</p>
        <p>
          {{
            formatDist(
              new Date(selectedEvent.overtime * 1000),
              new Date(totalWorkingTimePerDay * 1000)
            )
          }}
        </p>
      </div>
    </BModal>
  </div>
</template>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.title {
  display: flex;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.left_title {
  flex: 1;
}

.right_title .add {
  cursor: pointer;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: scroll;
}

.list_item {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  border-radius: 0.2rem;
  border: 1px solid #e4e4e7;
  background-color: white;
}

.list_item_id {
  width: 2rem;
  height: 2rem;
  background-color: #0052cc;
  border-radius: 0.2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list_item_data {
  flex: 1;
  display: flex;
  justify-content: space-evenly;
}

.working_time_row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.working_time_row p:first-child {
  color: gray;
  padding: 0;
}

.list_item_actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.update {
  width: 2rem;
  height: 2rem;
  background-color: #0052cc;
  border-radius: 0.2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.calendar {
  height: calc(100vh - 20rem);
}
</style>

<style>
.vuecal__event {
  color: white;
  cursor: pointer;
}
.vuecal__event.workingtime {
  background-color: #0052cc;
}
</style>
