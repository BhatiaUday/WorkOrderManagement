<template>
  <div>
    <h1>Sign Up</h1>
    <form @submit="handleSignUp">
      <!-- Remove wallet address input field since we get it from ConnectEthereum -->
      
      <!-- New Select Field for Institute or Student -->
      <select v-model="userType" required>
        <option disabled value="">Select User Type</option>
        <option value="Institute">Institute</option>
        <option value="Student">Student</option>
      </select>

      <button type="submit">Sign Up</button>
      
      <connect-ethereum class="app-navbar__connect-ethereum" preset="outline-brittle" />
    </form>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ConnectEthereum } from '@/common';  // Assuming this is your MetaMask connection component
import { useWeb3ProvidersStore } from '@/store';
import { doc, setDoc } from "firebase/firestore"; // Firebase Firestore methods
import { db } from "../firebase";  // Your Firebase Firestore configuration

// State variables
const userType = ref('');  // Field for Institute or Student
const web3Store = useWeb3ProvidersStore();  // Web3 store
const metamaskAddress = ref(''); // MetaMask address state

// Get wallet address from ConnectEthereum on component mount
const fetchWalletAddress = () => {
  if (web3Store.provider.isConnected) {
    metamaskAddress.value = web3Store.provider.selectedAddress;
  }
};

onMounted(() => {
  fetchWalletAddress();
});

// Handle Sign-Up
const handleSignUp = async (event: Event) => {
  event.preventDefault(); // Prevent form submission

  // Check if MetaMask is connected
  if (!web3Store.provider.isConnected) {
    alert('Please connect to MetaMask before signing up.');
    return;
  }

  // Check if walletAddress is available
  if (!metamaskAddress.value) {
    alert('Please connect to MetaMask and provide a wallet address.');
    return;
  }

  // Save user data and type in Firestore with walletAddress as docId
  try {
    await setDoc(doc(db, "users", metamaskAddress.value), {
      metamaskAddress: metamaskAddress.value,
      userType: userType.value,  // Save the selected user type
    });

    console.log("User data saved to Firestore.");
  } catch (error) {
    console.error("Error during sign up:", error.message);
  }
};
</script>
