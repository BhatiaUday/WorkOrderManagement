<template>
    <div class="documents-view">
      <h2>My Documents</h2>
      <div v-if="loading" class="loading">Loading documents...</div>
      <div v-if="!loading && filteredDocuments.length === 0">
        No documents found for your address.
      </div>
      <ul v-if="!loading && filteredDocuments.length > 0">
        <li v-for="doc in filteredDocuments" :key="doc.fileName">
          <h3>{{ doc.fileName }}</h3>
          <p><strong>Uploaded by:</strong> {{ doc.uploaderAddress }}</p>
          <p><strong>File Size:</strong> {{ doc.fileSize }} bytes</p>
          <p><strong>File Type:</strong> {{ doc.fileType }}</p>
          <p><strong>Upload Date:</strong> {{ doc.uploadDate }}</p>
          <a :href="doc.fileUrl" target="_blank">Download</a>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { useWeb3ProvidersStore } from '@/store'


  const web3Store = useWeb3ProvidersStore()

  export default {
    name: 'DocumentsView',
    data() {
      return {
        documents: [],
        filteredDocuments: [],
        walletAddress: '',
        loading: true,
      };
    },
    async mounted() {
      await this.fetchWalletAddress();
      await this.fetchDocuments();
      this.filterDocumentsByAddress();
    },
    methods: {
      async fetchWalletAddress() {
        try {
          // Fetch the wallet address from your web3Store
          this.walletAddress = web3Store.provider.selectedAddress;
        } catch (error) {
          console.error('Failed to fetch wallet address:', error);
        }
      },
      async fetchDocuments() {
        const firestore = getFirestore();
        const docsRef = collection(firestore, 'files');
        const querySnapshot = await getDocs(docsRef);
  
        // Extract documents
        this.documents = querySnapshot.docs.map(doc => doc.data());
        this.loading = false;
      },
      filterDocumentsByAddress() {
        // Filter documents where the walletAddress is part of the indicatedAddresses or uploaderAddress
        this.filteredDocuments = this.documents.filter(doc => 
          doc.indicatedAddresses?.includes(this.walletAddress) || doc.uploaderAddress === this.walletAddress
        );
      }
    }
  };
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
  </style>
  