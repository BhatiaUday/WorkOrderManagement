<template>
  <div class="p-4 space-y-6">
    <h2 class="text-2xl font-bold mb-4">My Documents</h2>

    <!-- Dropdown to filter by userType -->
    <div class="mb-4">
      <label for="userType" class="block text-sm font-medium mb-2">
        Filter by User Type:
      </label>
      <select
        v-model="selectedUserType"
        @change="filterDocumentsByUserType"
        id="userType"
        class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All</option>
        <option value="Institute">Institute</option>
        <option value="Contractor">Contractor</option>
        <option value="Student">Student</option>
      </select>
    </div>

    <div v-if="loading" class="text-center text-lg text-gray-600">
      Loading documents...
    </div>

    <div
      v-if="!loading && filteredDocuments.length === 0"
      class="text-center text-lg text-gray-600"
    >
      No documents found for your address or user type.
    </div>

    <ul v-if="!loading && filteredDocuments.length > 0" class="space-y-4">
      <li
        v-for="doc in filteredDocuments"
        :key="doc.fileName"
        class="bg-white p-4 rounded-lg shadow-md border border-gray-200"
      >
        <h3 class="text-xl font-semibold mb-2">
          {{ doc.fileName }}
        </h3>
        <p class="text-sm text-gray-700">
          <strong>Uploaded by:</strong> {{ doc.uploaderAddress }}
        </p>
        <p class="text-sm text-gray-700">
          <strong>User Type:</strong> {{ doc.uploadType }}
        </p>
        <p class="text-sm text-gray-700">
          <strong>File Size:</strong> {{ doc.fileSize }} bytes
        </p>
        <p class="text-sm text-gray-700">
          <strong>File Type:</strong> {{ doc.fileType }}
        </p>
        <p class="text-sm text-gray-700">
          <strong>Upload Date:</strong> {{ doc.uploadDate }}
        </p>
        <a :href="doc.fileUrl" target="_blank" class="block mt-2">
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Download
          </button>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { useWeb3ProvidersStore } from '@/store'

const web3Store = useWeb3ProvidersStore()

export default {
  name: 'documents-view',
  data() {
    return {
      documents: [],
      filteredDocuments: [],
      walletAddress: '',
      loading: true,
      selectedUserType: '', // Added for filtering by userType
    }
  },
  async mounted() {
    await this.fetchWalletAddress()
    await this.fetchDocuments()
    this.filterDocumentsByAddress()
  },
  methods: {
    async fetchWalletAddress() {
      try {
        // Fetch the wallet address from your web3Store
        this.walletAddress = web3Store.provider.selectedAddress
      } catch (error) {
        console.error('Failed to fetch wallet address:', error)
      }
    },
    async fetchDocuments() {
      const firestore = getFirestore()
      const docsRef = collection(firestore, 'files')
      const querySnapshot = await getDocs(docsRef)

      // Extract documents
      this.documents = querySnapshot.docs.map(doc => doc.data())
      this.loading = false
    },
    filterDocumentsByAddress() {
      // Filter documents where the walletAddress is part of the indicatedAddresses or uploaderAddress
      this.filteredDocuments = this.documents.filter(
        doc =>
          doc.indicatedAddresses?.includes(this.walletAddress) ||
          doc.uploaderAddress === this.walletAddress,
      )
    },
    filterDocumentsByUserType() {
      // Further filter the documents by the selected userType
      this.filteredDocuments = this.documents.filter(doc => {
        const isAddressMatch =
          doc.indicatedAddresses?.includes(this.walletAddress) ||
          doc.uploaderAddress === this.walletAddress
        const isUserTypeMatch = this.selectedUserType
          ? doc.uploadType === this.selectedUserType
          : true
        return isAddressMatch && isUserTypeMatch
      })
    },
  },
}
</script>

<style scoped>
.loading {
  font-size: 1.5em;
  text-align: center;
}

.documents-view ul {
  list-style-type: none;
  padding: 0;
}

.documents-view li {
  margin-bottom: 20px;
}

.filter {
  margin-bottom: 20px;
}
</style>
