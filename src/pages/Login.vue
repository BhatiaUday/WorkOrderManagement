<template>
    <div>
      <h1>Sign In</h1>
      <form @submit.prevent="handleSignIn">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>
  
      <h1>Sign Up</h1>
      <form @submit.prevent="handleSignUp">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  </template>
  
  <script>
  import { signUp, signIn } from '../FirebaseAuth';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
      };
    },
    methods: {
      async handleSignUp() {
        try {
          const userCredential = await signUp(this.email, this.password);
          console.log("User signed up:", userCredential.user);
        } catch (error) {
          console.error("Error signing up:", error.message);
        }
      },
      async handleSignIn() {
        try {
          const userCredential = await signIn(this.email, this.password);
          console.log("User signed in:", userCredential.user);
        } catch (error) {
          console.error("Error signing in:", error.message);
        }
      },
    },
  };
  </script>
  