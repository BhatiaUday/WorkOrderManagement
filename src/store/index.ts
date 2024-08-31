import { createPinia } from 'pinia'
import { defineStore } from 'pinia';  // Assuming you're using Pinia


const store = createPinia()


export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,  // User data
  }),
  actions: {
    setUser(user) {
      this.currentUser = user;
    },
  },
});

export { store }
export * from './modules'
