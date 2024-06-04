<template>
  <nav>
    <RouterLink to="/">
      <div class="logo">
        <div class="img"></div>
        <p>Time Manager</p>
        <BurgerIcon @click="toggleNav(false)" />
      </div>
    </RouterLink>
    <div class="teams-selection">
      <BDropdown
        :text="
          selectedTeamId ? teams.filter((t) => t.id === selectedTeamId)[0].name : 'No selection'
        "
        variant="outline-primary"
        class="teams-dropdown"
      >
        <BDropdownItem v-if="selectedTeamId" @click="() => teamStore.selectTeam(undefined)"
          >Unselect team</BDropdownItem
        >
        <BDropdownItem to="/teams">Manage teams</BDropdownItem>
        <BDropdownGroup header="My teams">
          <div v-if="teams.length">
            <BDropdownItem
              v-for="team in teams"
              :key="team.id"
              @click="() => teamStore.selectTeam(team.id)"
            >
              {{ team.name }}
            </BDropdownItem>
          </div>
          <div v-else>
            <BDropdownItem disabled>You are not in any team</BDropdownItem>
          </div>
        </BDropdownGroup>
      </BDropdown>
    </div>
    <div class="items">
      <RouterLink
        v-for="(route, index) in filteredRoutes"
        :key="index"
        class="item"
        :to="route.path"
        :class="
          (router.currentRoute.value.path === route.path ? 'selected' : '') +
          ' ' +
          (route.class ?? '')
        "
      >
        <div class="img"></div>
        <p>{{ route.name }}</p>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useLayoutStore } from '@/stores/layout'
import { useTeamStore } from '@/stores/team'
import { useRouter } from 'vue-router'

const teamStore = useTeamStore()

const { toggleNav } = useLayoutStore()

const { selectedTeamId } = storeToRefs(useTeamStore())
const { role, teams } = storeToRefs(useUserStore())
const { navOpen } = storeToRefs(useLayoutStore())

const router = useRouter()
const routes = router.getRoutes()
const navRoutes = ['/', '/clocks', '/workingTimes', '/charts', '/teams', '/admin']
const filteredRoutes = routes
  .filter((route) => navRoutes.includes(route.path))
  .filter((route) => {
    const userRole = role.value
    const routeRoles = route.meta.roles as string[] | undefined
    if (routeRoles) {
      return routeRoles.includes(userRole)
    } else {
      return true
    }
  })
  .map((route) => {
    const routeRoles = route.meta.roles as string[] | undefined
    if (routeRoles && routeRoles.includes(role.value)) {
      return {
        name: route.name,
        path: route.path,
        class: role.value
      }
    }

    return {
      name: route.name,
      path: route.path
    }
  })

const navDisplay = ref<'flex' | 'none'>('flex')

watchEffect(() => {
  navDisplay.value = navOpen.value ? 'flex' : 'none'
})
</script>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
  width: 20rem;
  background-color: white;
  padding: 1rem;
  gap: 1rem;
  height: 100%;
  z-index: 2;
}

nav a {
  text-decoration: none;
}

nav p {
  margin: 0;
}

nav svg {
  display: none;
}

@media screen and (max-width: 768px) {
  nav {
    position: absolute;
    display: v-bind(navDisplay);
  }

  nav p {
    flex: 1;
  }

  nav svg {
    display: block;
  }
}

.logo {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid #e4e4e7;
  padding: 0 1rem 1rem 1rem;
}

.logo .img {
  width: 2rem;
  height: 2rem;
  background-color: #0052cc;
  border-radius: 0.2rem;
}

.items {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  border-radius: 0.2rem;
  text-decoration: none;
  color: var(--color-text);
}

.item .img {
  width: 1rem;
  height: 1rem;
  background-color: gray;
  border-radius: 0.2rem;
}

.item.selected .img {
  background-color: #0052cc;
}

.item:hover {
  background-color: #f4f5f7;
  cursor: pointer;
}

.item.admin {
  background-color: #dc3545;
  color: white;
}

.actions {
  display: flex;
  width: 100%;
}

.actions button {
  flex: 1;
}

.teams-selection {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid #e4e4e7;
  padding: 0 1rem 1rem 1rem;
}

.teams-dropdown {
  width: 100%;
}
</style>
