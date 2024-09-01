<template>
  <div class="main-page p-6 space-y-6">
    <div class="main-page__introduction text-center">
      <div class="main-page__welcome flex flex-col items-center mb-6">
        <h1 class="text-4xl font-bold mb-4">Hi {{ personName }}!</h1>
        <router-link
          to="/uploads"
          class="text-xl font-semibold text-green-600 hover:text-blue-800"
        >
          Your Uploads
        </router-link>
      </div>
      <h4 class="main-page__description text-lg text-gray-700">
        Streamline work order management with our decentralized app for
        government colleges. Utilizing the Sign Protocol for secure, on-chain
        verification our dApp ensures transparent, tamper-proof processes and
        scalable solutions, transforming how work orders and approvals are
        managed.
      </h4>
    </div>

    <div
      class="main-page__container p-4 bg-gray-100 rounded-lg shadow-md"
      :class="{
        'main-page__container--lifted':
          web3Store.provider.isConnected && web3Store.isValidChain,
      }"
    >
      <transition name="fade">
        <div
          v-show="!web3Store.provider.isConnected || !web3Store.isValidChain"
          class="main-page__connect-ethereum p-4 border border-gray-300 rounded-lg bg-white"
          :class="{
            'main-page__connect-ethereum--connected':
              web3Store.provider.isConnected,
          }"
        >
          <h4
            class="main-page__connect-ethereum-message text-sm text-gray-600 mb-4"
          >
            {{ ethereumMessage }}
          </h4>
          <button
            @click="redirectToPage"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </div>
      </transition>

      <div
        class="main-page__card bg-white p-4 rounded-lg shadow-md border border-gray-200"
      >
        <h2 class="main-page__card-title text-2xl font-semibold mb-4">
          {{ $t('main-page.doc-creation-card-title') }}
        </h2>
        <svg class="main-page__card-illustration-wrp">
          <use href="/branding/upload.svg#upload" />
        </svg>
        <app-button
          class="main-page__card-button"
          preset="primary"
          :text="$t('main-page.doc-creation-card-button-text')"
          :disabled="!web3Store.provider.isConnected || !web3Store.isValidChain"
          @click="isDocCreationModalShown = true"
        />
        <doc-creation-modal v-model:is-shown="isDocCreationModalShown" />
      </div>

      <div
        class="main-page__card bg-white p-4 rounded-lg shadow-md border border-gray-200"
      >
        <h2 class="main-page__card-title text-2xl font-semibold mb-4">
          {{ $t('main-page.doc-verification-card-title') }}
        </h2>
        <svg class="main-page__card-illustration-wrp">
          <use href="/branding/verify.svg#verify" />
        </svg>
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
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, ConnectEthereum } from '@/common'
import { useContext } from '@/composables'
import { DocCreationModal, DocVerificationModal } from '@/modals'
import { useWeb3ProvidersStore } from '@/store'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

const web3Store = useWeb3ProvidersStore()
const { $t } = useContext()
const myVariable = web3Store.provider.selectedAddress
const isDocCreationModalShown = ref(false)
const isDocVerificationModalShown = ref(false)
const router = useRouter()
const personName = ref<string>('')
const route = useRoute()

onMounted(async () => {
  const walletAddress = web3Store.provider.selectedAddress as string

  try {
    const userDoc = await getDoc(doc(db, 'users', walletAddress))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      personName.value = userData.personName || 'User' // Fallback if personName is not available
    } else {
      console.log('No such user!')
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
})

const redirectToPage = () => {
  router.push('/register') // Use the route path
}

const ethereumMessage = computed(() => {
  switch (true) {
    case !web3Store.provider.isConnected:
      return $t('main-page.connect-ethereum-message')
    case !web3Store.isValidChain:
      return $t('main-page.switch-ethereum-message')
    default:
      return $t('main-page.connected-ethereum-message')
  }
})
</script>

<style lang="scss" scoped>
.main-page__introduction {
  margin: 0 auto;
  padding: toRem(44) toRem(44) toRem(28);
  fill: var(--col-peaceful);
  transition: fill var(--transition-duration-slow);
  max-width: max-content;
  text-align: center;

  &:hover {
    fill: var(--col-quiet);
  }

  @include respond-to(xmedium) {
    padding: toRem(38) toRem(38) toRem(24);
  }

  @include respond-to(medium) {
    padding: toRem(36) toRem(36) toRem(22);
  }

  @include respond-to(tablet) {
    padding: toRem(24) toRem(16) toRem(30);
  }
}

.main-page__welcome {
  position: relative;
  z-index: var(--z-layer-20);
  padding-bottom: toRem(22);
  width: toRem(822);

  @include respond-to(xmedium) {
    width: toRem(738);
  }

  @include respond-to(medium) {
    width: toRem(682);
  }

  @include respond-to(tablet) {
    width: toRem(564);
  }

  @include respond-to(small) {
    width: 100%;
  }
}

.main-page__welcome-background-img {
  position: absolute;
  bottom: toRem(0);
  left: toRem(0);
  z-index: var(--z-layer-negative-10);
  height: toRem(51);
  width: 100%;

  @include respond-to(xmedium) {
    height: toRem(46);
  }

  @include respond-to(medium) {
    height: toRem(43);
  }

  @include respond-to(tablet) {
    height: toRem(36);
  }
}

.main-page__description {
  color: var(--col-fancy);
  max-width: toRem(698);
  margin: 0 auto;

  @include respond-to(medium) {
    max-width: toRem(650);
  }

  @include respond-to(tablet) {
    max-width: toRem(520);
  }

  @include respond-to(small) {
    max-width: 100%;
  }
}

.main-page__connect-ethereum {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: toRem(16);
  background: var(--col-great);
  height: toRem(104);
  border-radius: var(--border-radius-large);
  padding: toRem(24) 7.8%;
  transition: background-color var(--transition-duration-slow);

  &--connected {
    justify-content: center;
  }

  &:hover {
    background: var(--col-mild);
  }

  @include respond-to(tablet) {
    flex-direction: column;
    height: toRem(168);
    margin: 0 toRem(16);
  }
}

.main-page__connect-ethereum-message {
  text-align: center;
  white-space: pre-line;
}

.main-page__connect-ethereum-button {
  width: toRem(256);
}

.main-page__container {
  position: relative;
  display: flex;
  gap: toRem(24);
  width: 100%;
  padding-top: toRem(128);
  transition: padding var(--transition-duration-slow) ease;
  max-width: max-content;
  margin: 0 auto toRem(44);

  &--lifted {
    transition-delay: 3.7s;
    transition-duration: var(--transition-duration-slowest);
    padding-top: 0;
  }

  @include respond-to(xmedium) {
    margin-bottom: toRem(38);
  }

  @include respond-to(medium) {
    gap: toRem(16);
    margin-bottom: toRem(36);

    &:not(.main-page__container--lifted) {
      padding-top: toRem(120);
    }
  }

  @include respond-to(tablet) {
    flex-direction: column;
    max-width: toRem(600);
    margin: 0 auto toRem(24);
    padding: 0 toRem(16);

    &:not(.main-page__container--lifted) {
      padding-top: toRem(184);
    }
  }
}

.main-page__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: toRem(16);
  color: var(--col-fine);
  background: var(--col-great);
  border-radius: var(--border-radius-large);
  padding: toRem(27) toRem(81);
  transition: background-color var(--transition-duration-slow);

  &:hover {
    background: var(--col-mild);
  }

  @include respond-to(xmedium) {
    padding: toRem(27) toRem(60);
  }

  @include respond-to(medium) {
    padding: toRem(27) toRem(50);
  }

  @include respond-to(tablet) {
    width: 100%;
  }
}

.main-page__card-title {
  @include caption;
}

.main-page__card-illustration-wrp {
  display: flex;
  align-items: center;
  justify-content: center;
  height: toRem(233);
  width: toRem(233);
  overflow: hidden;

  @include respond-to(xsmall) {
    height: toRem(163);
    width: toRem(163);
  }
}

.main-page__card-illustration {
  transform: scale(0.83511);

  @include respond-to(xsmall) {
    transform: scale(0.584);
  }
}

.main-page__card-button {
  @include respond-to(tablet) {
    max-width: toRem(233);
  }

  @include respond-to(xsmall) {
    max-width: toRem(163);
  }
}

.fade-leave-to {
  animation: fade 2s ease 2s;
}

.fade-enter-from {
  display: none;
}

.fade-enter-to {
  opacity: 0;
  animation: fade var(--transition-duration-slow) ease
    var(--transition-duration) reverse;
}

@keyframes fade {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
