<template>
  <div v-if="isInstitute" class="p-4 space-y-4">
    <h1 class="text-3xl font-bold mb-6">All Files</h1>

    <!-- Filter Options -->
    <div class="mb-4">
      <label for="fileType" class="block text-sm font-medium mb-2">Filter by File Type:</label>
      <select
        v-model="selectedFileType"
        @change="filterFiles"
        id="fileType"
        class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All</option>
        <option value="Student">Student</option>
        <option value="Institute">Institute</option>
        <option value="Contractor">Contractor</option>
        <!-- Add more file types as needed -->
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="file in filteredStudentFiles"
        :key="file.fileHash"
        class="bg-white p-4 rounded-lg shadow-md border border-gray-200"
      >
        <h2 class="text-xl font-semibold mb-2">{{ file.fileName }}</h2>
        <p class="text-sm text-gray-600 mb-2">Size: {{ formatSize(file.fileSize) }}</p>
        <p class="text-sm text-gray-600 mb-2">Type: {{ file.fileType }}</p>
        <p class="text-sm text-gray-600 mb-2">Uploader Address: {{ file.uploaderAddress }}</p>
        <p class="text-sm text-gray-600 mb-2">Upload Date: {{ formatDate(file.uploadDate) }}</p>
        <div class="flex justify-between items-center mt-4">
          <a :href="file.fileUrl" target="_blank" rel="noopener noreferrer">
            <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Download
            </button>
          </a>
          <app-button
            class="ml-2"
            preset="primary"
            :text="$t('main-page.doc-verification-card-button-text')"
            :disabled="!web3Store.provider.isConnected || !web3Store.isValidChain"
            @click="isDocVerificationModalShown = true"
          />
          <doc-verification-modal
            v-model:is-shown="isDocVerificationModalShown"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p class="text-center text-red-500">You do not have permission to view this page.</p>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useWeb3ProvidersStore } from '@/store';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { DocVerificationModal } from '@/modals';
import { AppButton } from '@/common';

const studentFiles = ref<any[]>([]);
const filteredStudentFiles = ref<any[]>([]);
const isInstitute = ref<boolean>(false);
const web3Store = useWeb3ProvidersStore();
const storage = getStorage();
const isDocVerificationModalShown = ref(false);
const selectedFileType = ref<string>('');

// Fetch the logged-in user's data
const checkUserType = async () => {
  const walletAddress = web3Store.provider.selectedAddress;
  if (!walletAddress) {
    alert('Please connect to MetaMask.');
    return;
  }

  try {
    const userQuery = query(collection(db, 'users'), where('metamaskAddress', '==', walletAddress));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0].data();
      if (userDoc.userType === 'Institute') {
        isInstitute.value = true;
        await fetchStudentFiles();
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error.message);
  }
};

// Fetch all files uploaded by students
const fetchStudentFiles = async () => {
  try {
    const filesSnapshot = await getDocs(collection(db, 'files'));
    studentFiles.value = filesSnapshot.docs.map(doc => doc.data());
    filterFiles();  // Apply the filter after fetching files
  } catch (error) {
    console.error('Error fetching student files:', error.message);
  }
};

// Apply filtering logic
const filterFiles = () => {
  filteredStudentFiles.value = studentFiles.value.filter(file => {
    const fileTypeMatch = selectedFileType.value ? file.uploadType === selectedFileType.value : true;
    return fileTypeMatch;
  });
};

// Format date to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Format file size to readable format
const formatSize = (size: number) => {
  return (size / 1024).toFixed(2) + ' KB';
};

// Generate a download link for the file
const getDownloadLink = async (fileHash: string) => {
  try {
    const fileRef = storageRef(storage, `documents/${fileHash}`);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error getting download URL:', error.message);
    return '#';
  }
};

// Check user type on page load
onMounted(() => {
  checkUserType();
});

// Watch for changes in selectedFileType to apply filters
watch(selectedFileType, () => {
  filterFiles();
});
</script>
