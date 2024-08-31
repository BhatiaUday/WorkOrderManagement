<template>
  <header class="bg-gray-800 shadow-md">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
      <!-- Logo -->
      <div class="flex items-center space-x-2">
        <svg class="h-12 w-12 text-white fill-current">
          <use href="/branding/logo.svg#logo" />
        </svg>
        <span class="text-white text-lg font-semibold">Run Time Terror</span>
      </div>

      <!-- Links / Buttons based on wallet connection -->
      <div class="flex items-center space-x-6">
        <!-- Show 'Your Uploads' if walletAddress is detected -->
        <router-link
      v-if="userType === 'Institute'"
      to="/new"
      class="text-white hover:text-blue-600 transition duration-300"
    >
    Student Uploads
    </router-link>

        <div v-if="walletAddress" class="flex space-x-4">
          <router-link
            to="/uploads"
            class="text-white hover:text-blue-600 transition duration-300 mt-2"
          >
            Uploads
          </router-link>

          <!-- Replace 'Register' button with the wallet address -->
          <span class="text-white bg-gray-700 px-4 py-2 rounded-lg">
            {{ walletAddress }}
          </span>
        </div>

        <!-- If walletAddress is not detected, show 'Connect to MetaMask' and 'Register' button -->
        <div v-else class="flex space-x-4">
          <button
            @click="connectToMetaMask"
            class="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition duration-300"
          >
            Connect to MetaMask
          </button>
          
          <router-link
            to="/register"
            class="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition duration-300"
          >
            Register
          </router-link>
        </div>

      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ConnectEthereum, SwitchEthereum } from '@/common'
import { useWeb3ProvidersStore } from '@/store'
import { ref, onMounted } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';  // Make sure the path is correct

const web3Store = useWeb3ProvidersStore()

const walletAddress = web3Store.provider.selectedAddress 
const userType = ref(null);

const fetchUserType = async () => {
  const userDocRef = doc(db, 'users', walletAddress);  // 'users' is the collection
  const docSnapshot = await getDoc(userDocRef);

  if (docSnapshot.exists()) {
    userType.value = docSnapshot.data().userType;  // Assuming 'userType' is a field in the document
  } else {
    console.log('No such document!');
  }
};

onMounted(() => {
  if (walletAddress) {
    fetchUserType(walletAddress);
  }
});


// Placeholder wallet address detection

// Function to connect to MetaMask
const connectToMetaMask = async () => {
  try {
    // Logic for connecting to MetaMask
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    console.log('Connected: ', accounts[0])
  } catch (error) {
    console.error('MetaMask connection failed:', error)
  }
}
</script>

<style lang="scss" scoped>
/* Add necessary styles */
</style>
