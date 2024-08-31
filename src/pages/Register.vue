<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      

      <!-- Conditional Sign-Up Form or Message -->
      <div v-if="!isSignedUp">
        <h1 class="text-3xl font-bold text-center mb-6">Sign Up</h1>
        <form @submit="handleSignUp" class="space-y-4">
          <div class="flex flex-col">
            <label for="personName" class="mb-1 text-sm font-medium">User Name</label>
            <input
              type="text"
              id="personName"
              v-model="personName"
              placeholder="Enter your name"
              required
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Conditional Field for Institute Name -->
          <div v-if="userType === 'Institute'" class="flex flex-col">
            <label for="instituteName" class="mb-1 text-sm font-medium">Institute Name</label>
            <input
              type="text"
              id="instituteName"
              v-model="instituteName"
              placeholder="Enter institute name"
              required
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Select Field for User Type -->
          <div class="flex flex-col">
            <label for="userType" class="mb-1 text-sm font-medium">User Type</label>
            <select
              v-model="userType"
              id="userType"
              required
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option disabled value="">Select User Type</option>
              <option value="Institute">Institute</option>
              <option value="Student">Student</option>
              <option value="Contractor">Contractor</option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Up
          </button>

          <connect-ethereum class="app-navbar__connect-ethereum mt-4" preset="outline-brittle" />
        </form>
      </div>

      <!-- Message Box for Already Signed Up -->
      <div v-if="isSignedUp && metamaskAddress" class="bg-yellow-200 p-4 rounded-md mt-6">
        <p class="text-center text-yellow-800 font-semibold">You are already signed up!</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'; // Import Vue Router
import { ConnectEthereum } from '@/common';  // Assuming this is your MetaMask connection component
import { useWeb3ProvidersStore } from '@/store';
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firebase Firestore methods
import { db } from "../firebase";  // Your Firebase Firestore configuration

// State variables
const userType = ref('');  // Field for Institute or Student
const personName = ref('');  // Field for Person Name
const instituteName = ref('');  // Field for Institute Name
const isSignedUp = ref(false);  // Variable to check if the user is signed up
const metamaskAddress = ref(''); // MetaMask address state
const message = ref(''); // Message to display success or error
const isSuccess = ref(true); // Flag to determine if the message is success or error

// Use Vue Router
const router = useRouter();
const web3Store = useWeb3ProvidersStore();  // Web3 store

// Get wallet address from ConnectEthereum on component mount
const fetchWalletAddress = async () => {
  if (web3Store.provider.isConnected) {
    metamaskAddress.value = web3Store.provider.selectedAddress;
    // Check if the user is signed up
    isSignedUp.value = await checkIfUserSignedUp(metamaskAddress.value);
  }
};

onMounted(() => {
  fetchWalletAddress();
});

// Check if the user is already signed up
const checkIfUserSignedUp = async (walletAddress: string) => {
  const userDoc = await getDoc(doc(db, "users", walletAddress));
  return userDoc.exists();
};

// Handle Sign-Up
const handleSignUp = async (event: Event) => {
  event.preventDefault(); // Prevent form submission

  // Check if MetaMask is connected
  if (!web3Store.provider.isConnected) {
    message.value = 'Please connect to MetaMask before signing up.';
    isSuccess.value = false;
    return;
  }

  // Check if walletAddress is available
  if (!metamaskAddress.value) {
    message.value = 'Please connect to MetaMask and provide a wallet address.';
    isSuccess.value = false;
    return;
  }

  // Check if the user is already signed up
  const isUserSignedUp = await checkIfUserSignedUp(metamaskAddress.value);
  if (isUserSignedUp) {
    message.value = 'You are already signed up.';
    isSuccess.value = false;
    isSignedUp.value = true; // Update to show the signed-up message
    return;
  }

  // Prepare the user data
  const userData = {
    metamaskAddress: metamaskAddress.value,
    personName: personName.value,
    userType: userType.value,
  };

  // Include instituteName if userType is Institute
  if (userType.value === 'Institute') {
    userData.instituteName = instituteName.value;
  }

  // Save user data and type in Firestore with walletAddress as docId
  try {
    await setDoc(doc(db, "users", metamaskAddress.value), userData);
    console.log("User data saved to Firestore.");
    
    // Mark the user as signed up and show greeting
    isSignedUp.value = true;
    message.value = 'Sign-up successful!';
    isSuccess.value = true;

    // Redirect based on userType
    if (userType.value === 'Institute') {
      router.push('/new'); // Redirect to /new if userType is Institute
    } else {
      router.push('/'); // Redirect to / if userType is not Institute
    }
  } catch (error) {
    console.error("Error during sign up:", error.message);
    message.value = 'Error during sign-up. Please try again.';
    isSuccess.value = false;
  }
};
</script>
