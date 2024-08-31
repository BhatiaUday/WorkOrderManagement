<template>
  <div v-if="isInstitute">
    <h1>Student Files</h1>
    <table>
      <thead>
        <tr>
          <th>File Name</th>
          <th>File Size</th>
          <th>File Type</th>
          <th>Uploader Address</th>
          <th>Upload Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      
      <tbody>
        <tr v-for="file in studentFiles" :key="file.fileHash">
          <td>{{ file.fileName }}</td>
          <td>{{ formatSize(file.fileSize) }}</td>
          <td>{{ file.fileType }}</td>
          <td>{{ file.uploaderAddress }}</td>
          <td>{{ formatDate(file.uploadDate) }}</td>
          <td>
            <a :href="file.fileUrl" target="_blank" rel="noopener noreferrer">Download</a>
          </td>
          <app-button
          class="main-page__card-button"
          preset="primary"
          :text="$t('main-page.doc-verification-card-button-text')"
          :disabled="!web3Store.provider.isConnected || !web3Store.isValidChain"
          @click="isDocVerificationModalShown = true"
        />
        <doc-verification-modal
          v-model:is-shown="isDocVerificationModalShown"
        />
        </tr>
      </tbody>
      
    </table>
    
  </div>
  <div v-else>
    <p>You do not have permission to view this page.</p>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getDocs, collection, query, where } from 'firebase/firestore'; // Firebase Firestore methods
import { db } from '@/firebase';  // Adjust the path to your firebase config
import { useWeb3ProvidersStore } from '@/store';  // Adjust the path to your Web3 store
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';  // Firebase Storage methods
import { DocVerificationModal } from '@/modals'
import { AppButton} from '@/common'



const studentFiles = ref<any[]>([]);  // State to hold the list of files
const isInstitute = ref<boolean>(false);  // Flag to check if the user is an Institute
const web3Store = useWeb3ProvidersStore(); // Use your Web3 provider store
const storage = getStorage();  // Initialize Firebase Storage
const isDocVerificationModalShown = ref(false)

// Fetch the logged-in user's data
const checkUserType = async () => {
  const walletAddress = web3Store.provider.selectedAddress;  // Get the wallet address
  if (!walletAddress) {
    alert('Please connect to MetaMask.');
    return;
  }

  try {
    // Query the user data based on wallet address
    const userQuery = query(collection(db, 'users'), where('metamaskAddress', '==', walletAddress));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0].data();
      if (userDoc.userType === 'Institute') {
        isInstitute.value = true;  // Set flag if user is an Institute
        await fetchStudentFiles();  // Fetch files if the user is an Institute
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
  } catch (error) {
    console.error('Error fetching student files:', error.message);
  }
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

// Generate a download link for the file (using fileHash)
const getDownloadLink = async (fileHash: string) => {
  try {
    // Create a reference to the file in Firebase Storage under the "documents" folder
    const fileRef = storageRef(storage, `documents/${fileHash}`);
    // Get the download URL
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error getting download URL:', error.message);
    return '#';  // Fallback if there is an error
  }
};

// Check user type on page load
onMounted(() => {
  checkUserType();
});
</script>
