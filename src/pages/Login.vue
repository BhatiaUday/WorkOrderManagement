<template>
  <div>
    <h1>Sign In</h1>
    <form @submit="handleSignIn">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>

    <h1>Sign Up</h1>
    <form @submit="handleSignUp">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
      
      <!-- Switch Ethereum Component -->
      <switch-ethereum
        v-if="web3Store.provider.isConnected"
        class="app-navbar__switch-ethereum"
      />

      <!-- Connect Ethereum Button -->
      <connect-ethereum class="app-navbar__connect-ethereum" preset="outline-brittle" />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { signUp, signIn } from '../FirebaseAuth';
import { ConnectEthereum, SwitchEthereum } from '@/common';
import { useWeb3ProvidersStore } from '@/store';

// State variables using ref
const email = ref('');
const password = ref('');
const web3Store = useWeb3ProvidersStore();

// Handle Sign-Up
const handleSignUp = async (event: Event) => {
  event.preventDefault(); // Prevent form from submitting
  try {
    const userCredential = await signUp(email.value, password.value);
    console.log("User signed up:", userCredential.user);
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
};

// Handle Sign-In
const handleSignIn = async (event: Event) => {
  event.preventDefault(); // Prevent form from submitting
  try {
    const userCredential = await signIn(email.value, password.value);
    console.log("User signed in:", userCredential.user);
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};

console.log('Web3 Provider isConnected:', web3Store.provider.isConnected);
</script>
