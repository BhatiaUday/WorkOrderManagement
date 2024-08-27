<template>
    <div>
      <h1>Sign Up</h1>
      <form @submit="handleSignUp">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
        
        <connect-ethereum class="app-navbar__connect-ethereum" preset="outline-brittle" />
      </form>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { signUp } from '../FirebaseAuth';  // Import your sign-up logic
  import { ConnectEthereum } from '@/common';  // Assuming this is your MetaMask connection component
  import { useWeb3ProvidersStore } from '@/store';
  import { doc, setDoc } from "firebase/firestore"; // Firebase Firestore methods
  import { db } from "../firebase";  // Your Firebase Firestore configuration
  
  // State variables
  const email = ref('');
  const password = ref('');
  const web3Store = useWeb3ProvidersStore();
  const metamaskAddress = ref(''); // MetaMask address state
  
  // Handle Sign-Up
  const handleSignUp = async (event: Event) => {
    event.preventDefault(); // Prevent form submission
  
    // Check if MetaMask is connected
    if (!web3Store.provider.isConnected) {
      alert('Please connect to MetaMask before signing up.');
      return;
    }
  
    // Get MetaMask address
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      metamaskAddress.value = accounts[0];
      console.log("MetaMask Address:", metamaskAddress.value);
      
      // Sign up the user with email and password
      const userCredential = await signUp(email.value, password.value);
      console.log("User signed up:", userCredential.user);
  
      // Save user data and MetaMask address in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email.value,
        metamaskAddress: metamaskAddress.value,
      });
  
      console.log("MetaMask address saved to Firestore.");
    } catch (error) {
      console.error("Error during sign up:", error.message);
    }
  };
  </script>
  