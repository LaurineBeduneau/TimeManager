<template>
  <h2>Teams</h2>

  <BTabs @activate-tab="activeTab">
    <BTab title="My teams">
      <div class="list">
        <div v-for="team in teams" :key="team.id" class="list_item">
          <div class="list_item_id">
            {{ team.id }}
          </div>
          <div class="list_item_data">{{ team.name }}</div>
          <div class="list_item_actions">
            <BButton variant="info" @click="() => handleOpenModalTeam(team.id)">
              <UpdateIcon v-if="canManage" color="white" />
              <p v-else>Info</p>
            </BButton>
            <BButton v-if="canManage" variant="danger" @click="() => removeTeam(team.id)"
              >Remove</BButton
            >
          </div>
        </div>
      </div>
    </BTab>

    <BTab title="Create a team" v-if="canManage">
      <p v-if="createTeamMessage">{{ createTeamMessage }}</p>
      <form @submit.prevent="createTeam">
        <div class="form-group">
          <label for="teamName">Team name</label>
          <input type="text" id="teamName" name="teamName" v-model="teamNameCreation" />
        </div>

        <button type="submit">Create</button>
      </form>
    </BTab>

    <BTab title="Add a member" v-if="canManage">
      <div class="list">
        <div v-for="team in teams" :key="team.id" class="list_item">
          <div class="list_item_id">
            {{ team.id }}
          </div>
          <div class="list_item_data">{{ team.name }}</div>
          <div class="list_item_actions">
            <BButton variant="success" @click="() => handleOpenModalAdd(team.id)">Add</BButton>
          </div>
        </div>
      </div>
    </BTab>
  </BTabs>

  <BModal
    v-model="editTeamModal"
    @ok="() => canManage && handleUpdateTeam()"
    :title="(canManage ? 'Edit Team : ' : 'Team : ') + newTeam.name"
  >
    <form name="edit-team-form" @submit.prevent>
      <div class="form-content">
        <div class="form-slot">
          <label for="name-edit">Team name</label>
          <input
            type="text"
            name="name-edit"
            id="name-edit"
            v-model="newTeam.name"
            :disabled="!canManage"
          />
        </div>
      </div>
    </form>

    <div class="team-members">
      <p>Members ({{ newTeam.members.length }})</p>
      <div class="list">
        <div v-for="member in newTeam.members" :key="member.id" class="list_item">
          <!-- <a :href="'/admin/users/' + member.id"> -->
          <div class="list_item_id">
            {{ member.id }}
          </div>
          <div class="list_item_data">
            {{ member.email }} - {{ member.username }} - {{ member.role }}
            <BButton
              v-if="canManage && member.id !== myId && !checkCanManage(member.role)"
              variant="danger"
              @click="() => removeTeamMember(newTeam.id, member.id)"
            >
              Remove
            </BButton>
          </div>
          <!-- </a> -->
        </div>
      </div>
    </div>
  </BModal>

  <BModal
    v-model="editTeamModalAdd"
    @ok="handleUpdateTeamAdd"
    :title="'Add a member to : ' + newTeam.name"
    ok-title="Add"
  >
    <form name="edit-team-form" @submit.prevent>
      <div class="form-content">
        <div class="form-slot">
          <label for="name-edit">Member username</label>
          <input type="text" name="name-edit" id="name-edit" v-model="memberAddName" />
        </div>
      </div>
    </form>

    <div class="team-members">
      <p>Members ({{ newTeam.members.length }})</p>
      <div class="list">
        <div v-for="member in newTeam.members" :key="member.id" class="list_item">
          <!-- <a :href="'/admin/users/' + member.id"> -->
          <div class="list_item_id">
            {{ member.id }}
          </div>
          <div class="list_item_data">
            {{ member.email }} - {{ member.username }} - {{ member.role }}
          </div>
          <!-- </a> -->
        </div>
      </div>
    </div>
  </BModal>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from 'vue'
import api from '@/scripts/api'
import { storeToRefs } from 'pinia'

const { fetchUser } = useUserStore()
const { role, teams, id: myId } = storeToRefs(useUserStore())
const router = useRouter()

const manageRoles = ['manager', 'admin']
const canManage = manageRoles.includes(role.value)
const checkCanManage = (userRole: string) => {
  return manageRoles.includes(userRole)
}

const tabs = ['', '/create', '/add']
const currentActiveTab = ref<number>(0)
const mounting = ref<boolean>(true)
const updateUrl = () => {
  history.pushState({}, '', `/teams${tabs[currentActiveTab.value]}`)
}
const activeTab = (index: number) => {
  currentActiveTab.value = index
  if (!mounting.value) updateUrl()
}

onMounted(async () => {
  await fetchUser()

  const currentRoute = router.currentRoute.value
  if (currentRoute.path === '/teams/create') {
    ;(
      document.evaluate(
        "//button[text() = 'Create a team']",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLElement
    )?.click()
  } else if (currentRoute.path === '/teams/add') {
    ;(
      document.evaluate(
        "//button[text() = 'Add a member']",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLElement
    )?.click()
  }

  updateUrl()
  mounting.value = false
})

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

const editTeamModal = ref<boolean>(false)
const newTeam = ref<Team>({
  id: -1,
  name: '',
  members: []
})

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

async function handleUpdateTeam() {
  try {
    const response = await api.updateTeam(newTeam.value.id, newTeam.value.name)
    if (response.status === 200) {
      handleCloseModalTeam()
      await fetchUser()
    } else {
      alert('Error')
    }
  } catch (error) {
    console.error(error)
    handleCloseModalTeam()
    alert('An error occured, please try again, see console for more details')
  }
}

async function removeTeam(teamId: number) {
  try {
    const response = await api.removeTeam(teamId)
    if (response.status === 204) {
      await fetchUser()
    } else {
      alert('Error')
    }
  } catch (error) {
    console.error(error)
    alert('An error occured, please try again, see console for more details')
  }
}

const editTeamModalAdd = ref<boolean>(false)
const memberAddName = ref<string>('')

const handleOpenModalAdd = (teamId: number) => {
  memberAddName.value = ''
  editTeamModalAdd.value = true
  newTeam.value.name = teams.value.filter((team) => team.id === teamId)[0].name
  newTeam.value.id = teamId
  api.getTeamMembers(teamId).then((response) => {
    newTeam.value.members = response.data['data']
  })
}

const handleCloseModalAdd = () => {
  editTeamModalAdd.value = false
  newTeam.value.name = ''
  newTeam.value.id = -1
  memberAddName.value = ''
}

async function handleUpdateTeamAdd() {
  try {
    const responseUsername = await api.getUserByUsername(memberAddName.value)
    if (responseUsername.status === 200) {
      const response = await api.addTeamMember(newTeam.value.id, responseUsername.data['data'].id)
      if (response.status === 201) {
        handleCloseModalAdd()
        await fetchUser()
      } else {
        alert('Error')
      }
    } else {
      alert('User not found')
    }
  } catch (error) {
    console.error(error)
    handleCloseModalAdd()
    alert('An error occured, please try again, see console for more details')
  }
}

async function removeTeamMember(teamId: number, memberId: number) {
  try {
    const response = await api.removeTeamMember(teamId, memberId)
    if (response.status === 200) {
      api.getTeamMembers(teamId).then((response) => {
        newTeam.value.members = response.data['data']
      })
    } else {
      alert('Error')
    }
  } catch (error) {
    console.error(error)
    alert('An error occured, please try again, see console for more details')
  }
}

const teamNameCreation = ref('')
const createTeamMessage = ref('')
const createTeam = async () => {
  const response = await api.createTeam(teamNameCreation.value)
  if (response.status === 201) {
    await fetchUser()
    createTeamMessage.value = 'Team created'
  } else {
    createTeamMessage.value = 'Error'
  }
}
</script>

<style scoped>
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
</style>
