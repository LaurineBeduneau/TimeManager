<template>
  <h1>Administration</h1>
  <BTabs @activate-tab="activeTab">
    <BTab title="Users">
      <div class="list">
        <div v-for="user in users" :key="user.id" class="list_item">
          <div class="list_item_id">
            {{ user.id }}
          </div>
          <div class="list_item_data">{{ user.email }} - {{ user.username }} - {{ user.role }}</div>
          <div class="list_item_actions">
            <BButton variant="info" @click="() => handleOpenModal(user.id)">
              <UpdateIcon color="white" />
            </BButton>
            <BButton variant="danger" @click="() => removeUser(user.id)">Remove</BButton>
          </div>
        </div>
      </div>
    </BTab>
    <BTab title="Teams">
      <div class="list">
        <div v-for="team in teams" :key="team.id" class="list_item">
          <div class="list_item_id">
            {{ team.id }}
          </div>
          <div class="list_item_data">{{ team.name }}</div>
          <div class="list_item_actions">
            <BButton variant="info" @click="() => handleOpenModalTeam(team.id)">
              <UpdateIcon color="white" />
            </BButton>
            <BButton variant="danger" @click="() => removeTeam(team.id)">Remove</BButton>
          </div>
        </div>
      </div>
    </BTab>
  </BTabs>

  <!-- Edit user modal -->
  <BModal v-model="editModal" @ok="handleUpdateUser" title="Edit User">
    <form name="edit-form" @submit.prevent>
      <div class="form-content">
        <div class="form-slot">
          <label for="email-edit">email: </label>
          <input type="email" name="email-edit" id="email-edit" v-model="newUser.email" />
        </div>
        <div class="form-slot">
          <label for="username-edit">username: </label>
          <input type="text" name="username-edit" id="username-edit" v-model="newUser.username" />
        </div>
        <div class="form-slot">
          <label for="role-edit">role: </label>
          <select name="role-edit" id="role-edit" v-model="newUser.role">
            <option value="user">user</option>
            <option value="manager">manager</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>
    </form>
  </BModal>

  <!-- Edit team modal -->
  <BModal v-model="editTeamModal" @ok="handleUpdateTeam" title="Edit Team">
    <form name="edit-team-form" @submit.prevent>
      <div class="form-content">
        <div class="form-slot">
          <label for="name-edit">Team name</label>
          <input type="text" name="name-edit" id="name-edit" v-model="newTeam.name" />
        </div>
      </div>
    </form>

    <div class="team-members">
      <p>Members ({{ newTeam.members.length }})</p>
      <div class="list">
        <div v-for="member in newTeam.members" :key="member.id" class="list_item">
          <a :href="'/admin/users/' + member.id">
            <div class="list_item_id">
              {{ member.id }}
            </div>
            <div class="list_item_data">
              {{ member.email }} - {{ member.username }} - {{ member.role }}
            </div>
          </a>
        </div>
      </div>
    </div>
  </BModal>
</template>

<script setup lang="ts">
import api from '../scripts/api'
import { ref, onMounted } from 'vue'
import UpdateIcon from '../components/icons/UpdateIcon.vue'
import { useRouter } from 'vue-router'

type User = {
  id: number
  email: string
  username: string
  role: string
}

type Team = {
  id: number
  name: string
  members: User[]
}

const router = useRouter()
const users = ref<User[]>([])
const teams = ref<Team[]>([])
const editModal = ref<boolean>(false)
const editTeamModal = ref<boolean>(false)
const newUser = ref<User>({
  id: -1,
  email: '',
  username: '',
  role: 'user'
})
const newTeam = ref<Team>({
  id: -1,
  name: '',
  members: []
})

const getUsers = async () => {
  const response = await api.getUsers()
  users.value = response.data['data']
}

const getTeams = async () => {
  const response = await api.getTeams()
  teams.value = response.data['data']
}

const handleOpenModal = (userId: number) => {
  editModal.value = true
  newUser.value.email = users.value.filter((user) => user.id === userId)?.[0].email
  newUser.value.username = users.value.filter((user) => user.id === userId)?.[0].username
  newUser.value.role = users.value.filter((user) => user.id === userId)?.[0].role
  newUser.value.id = userId
}

const handleCloseModal = () => {
  editModal.value = false
  newUser.value.email = ''
  newUser.value.username = ''
  newUser.value.role = 'user'
  newUser.value.id = -1
}

const handleOpenModalTeam = (teamId: number) => {
  editTeamModal.value = true
  newTeam.value.name = teams.value.filter((team) => team.id === teamId)[0].name
  newTeam.value.id = teamId
  api.getTeamMembers(teamId).then((response) => {
    newTeam.value.members = response.data['data']
  })
}

const handleCloseModalTeam = () => {
  editTeamModal.value = false
  newTeam.value.name = ''
  newTeam.value.id = -1
}

async function handleUpdateUser() {
  await api
    .updateUser(newUser.value.id, newUser.value.username, newUser.value.email, newUser.value.role)
    .then(() => {
      handleCloseModal()
      getUsers()
    })
    .catch((error) => {
      console.error(error)
      handleCloseModal()
      alert('An error occured, please try again, see console for more details')
    })
}

async function handleUpdateTeam() {
  await api
    .updateTeamAdmin(newTeam.value.id, newTeam.value.name)
    .then(() => {
      handleCloseModalTeam()
      getTeams()
    })
    .catch((error) => {
      console.error(error)
      handleCloseModalTeam()
      alert('An error occured, please try again, see console for more details')
    })
}

async function removeUser(userId: number) {
  await api
    .removeUser(userId)
    .then(() => {
      getUsers()
    })
    .catch((error) => {
      console.error(error)
      alert('An error occured, please try again, see console for more details')
    })
}

async function removeTeam(teamId: number) {
  await api
    .removeTeamAdmin(teamId)
    .then(() => {
      getTeams()
    })
    .catch((error) => {
      console.error(error)
      alert('An error occured, please try again, see console for more details')
    })
}

const tabs = ['users', 'teams']
const currentActiveTab = ref<number>(0)
const mounting = ref<boolean>(true)
const activeTab = (index: number) => {
  currentActiveTab.value = index
  if (!mounting.value) updateUrl()
}

const updateUrl = () => {
  history.pushState({}, '', '/admin/' + tabs[currentActiveTab.value])
}

onMounted(async () => {
  await router.isReady()

  const currentRoute = router.currentRoute.value.path
  if (currentRoute === '/admin/users') {
    ;(
      document.evaluate(
        "//button[text() = 'Users']",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLElement
    )?.click()
  } else if (currentRoute === '/admin/teams') {
    ;(
      document.evaluate(
        "//button[text() = 'Teams']",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLElement
    )?.click()
  }

  updateUrl()
  mounting.value = false

  await getUsers()
  await getTeams()

  if (currentRoute.startsWith('/admin/users/')) {
    const userId = parseInt(currentRoute.split('/admin/users/')?.[1])

    if (userId) {
      handleOpenModal(userId)
    }
  }
})
</script>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.list_item {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
}

.list_item a {
  display: flex;
  width: 100%;
}

.list_item_id {
  flex: 1;
  flex-direction: row;
  display: flex;
  justify-content: center;
}

.list_item_data {
  flex: 3;
}

.list_item_actions {
  flex: 1;
  gap: 1rem;
  display: flex;
}

.list_item_actions .update {
  cursor: pointer;
}

.list_item_actions .update:hover {
  color: #0052cc;
}

.list_item_actions .delete {
  cursor: pointer;
}

.list_item_actions .delete:hover {
  color: #d73a49;
}

.list_item_actions .delete:active {
  color: #d73a49;
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

.form-field {
  height: 2rem;
}
</style>
