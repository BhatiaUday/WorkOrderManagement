<template>
  <form @submit.prevent="handleSubmit">
    <input type="text" v-model="walletAddress" placeholder="Wallet Address" />
    <textarea v-model="documentContent" placeholder="Document Content"></textarea>
    <button type="submit">Submit</button>
  </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'

const walletAddress = ref('')
const documentContent = ref('')

const handleSubmit = async () => {
  if (walletAddress.value && documentContent.value) {
    try {
      await addDoc(collection(db, 'documents'), {
        walletAddress: walletAddress.value,
        content: documentContent.value,
        createdAt: new Date()
      })
      alert('Document submitted successfully')
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }
}
</script>
