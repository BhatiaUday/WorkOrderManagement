export { default as Animation } from './Animation.vue'
export { default as Icon } from './Icon.vue'
export { default as AppButton } from './AppButton.vue'
export { default as AppNavbar } from './AppNavbar.vue'
export { default as Notification } from './Notification.vue'
export { default as Modal } from './Modal.vue'
export { default as ConnectEthereum } from './ConnectEthereum.vue'
export { default as Spinner } from './loader/Spinner.vue'
export { default as PaginationControl } from './PaginationControl.vue'
export { default as SwitchEthereum } from './SwitchEthereum.vue'
import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/MainPage.vue'
import NewPage from '@/pages/NewPage.vue'  // Import the new page component

const routes = [
    { path: '/test', component: MainPage },
  
  { path: '/new', component: NewPage },  // Define the route for the new page
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export { router }
