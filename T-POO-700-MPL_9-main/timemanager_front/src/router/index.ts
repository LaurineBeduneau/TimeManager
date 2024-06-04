import { createRouter, createWebHistory } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useLayoutStore } from '@/stores/layout'

import Home from '@/views/HomeVue.vue'
import Clocks from '@/views/ClocksVue.vue'
import WorkingTimes from '@/views/WorkingTimes.vue'
import Profile from '@/views/ProfileVue.vue'
import Admin from '@/views/AdminVue.vue'
import Login from '@/views/LoginVue.vue'
import Register from '@/views/RegisterVue.vue'
import Logout from '@/views/LogoutVue.vue'
import Teams from '@/views/TeamsVue.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    name: 'Home',
    path: '/',
    component: Home,
    meta: {
      auth: true
    }
  },
  {
    name: 'Clocks',
    path: '/clocks',
    component: Clocks,
    meta: {
      auth: true
    }
  },
  {
    name: 'Working Times',
    path: '/workingTimes',
    component: WorkingTimes,
    props: true,
    meta: {
      auth: true
    }
  },
  {
    name: 'Profile',
    path: '/profile',
    component: Profile,
    meta: {
      auth: true
    }
  },
  {
    name: 'Login',
    path: '/login',
    component: Login,
    meta: {
      auth: false
    }
  },
  {
    name: 'Register',
    path: '/register',
    component: Register,
    meta: {
      auth: false
    }
  },
  {
    name: 'Logout',
    path: '/logout',
    component: Logout,
    meta: {
      auth: true
    }
  },
  {
    name: 'Teams',
    path: '/teams',
    component: Teams,
    meta: {
      auth: true
    }
  },
  {
    name: 'TeamsCreate',
    path: '/teams/create',
    component: Teams,
    meta: {
      auth: true,
      roles: ['admin', 'manager']
    }
  },
  {
    name: 'TeamsAdd',
    path: '/teams/add',
    component: Teams,
    meta: {
      auth: true,
      roles: ['admin', 'manager']
    }
  },
  {
    name: 'Admin',
    path: '/admin',
    component: Admin,
    meta: {
      auth: true,
      roles: ['admin']
    }
  },
  {
    name: 'AdminUsers',
    path: '/admin/users/',
    component: Admin,
    meta: {
      auth: true,
      roles: ['admin']
    }
  },
  {
    name: 'AdminUsersSelection',
    path: '/admin/users/:id',
    component: Admin,
    meta: {
      auth: true,
      roles: ['admin']
    }
  },
  {
    name: 'AdminTeams',
    path: '/admin/teams',
    component: Admin,
    meta: {
      auth: true,
      roles: ['admin']
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  },
  {
    path: '/:pathMatch(.*)',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.auth)
  const roles = (to.meta.roles as string[]) || []

  const userStore = useUserStore()
  await userStore.waitFetching()

  if (requiresAuth && !userStore.logged) {
    next({ name: 'Login' })
  } else if (requiresAuth && roles.length && !roles.includes(userStore.role)) {
    next({ name: 'Home' })
  } else if (!requiresAuth && userStore.logged) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

router.afterEach(() => {
  const { navOpen } = storeToRefs(useLayoutStore())

  if (navOpen.value) {
    useLayoutStore().toggleNav()
  }
})

export default router
