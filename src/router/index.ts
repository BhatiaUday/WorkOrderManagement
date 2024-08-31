import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  useRoute,
  useRouter,
} from 'vue-router'
import { ROUTE_NAMES } from '@/enums'

// Define your routes including the new page
const routes: Array<RouteRecordRaw> = [
 
  {
    path: '/',
    name: ROUTE_NAMES.main,
    component: () => import('@/pages/MainPage.vue'),
  },
  
  {
    path: '/uploads',
    name: ROUTE_NAMES.uploads,  // Add a name for the new route
    component: () => import('@/pages/UploadedFiles.vue'), // Import the new page component
  },
  {
    path: '/register',
    name: ROUTE_NAMES.register,  // Add a name for the new route
    component: () => import('@/pages/Register.vue'), // Import the new page component
  },
  {
    path: '/profile',
    name: ROUTE_NAMES.profile,  // Add a name for the new route
    component: () => import('@/pages/Profile.vue'), // Import the new page component
  },
  {
    path: '/new',
    name: ROUTE_NAMES.newPage,  // Add a name for the new route
    component: () => import('@/pages/NewPage.vue'), // Import the new page component
  },
]

// Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 }),
})

export { router, useRouter, useRoute }
