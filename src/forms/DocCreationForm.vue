<template>
  <form class="doc-creation-form" @submit.prevent>
    <transition name="fade" mode="out-in">
      <div
        v-if="isSubmitting || isInitializing"
        class="doc-creation-form__container"
      >
        <spinner />
        <h5 class="doc-creation-form__please-wait-msg">
          {{ $t('doc-creation-form.please-wait-msg') }}
        </h5>
      </div>
      <div v-else-if="isConfirmationShown" class="doc-creation-form__container">
        <div class="doc-creation-form__note doc-creation-form__note--success">
          <icon
            class="doc-creation-form__note-icon"
            :name="$icons.checkCircle"
          />
          <p>
            {{ $t('doc-creation-form.success-msg') }}
          </p>
        </div>
        <textarea-field
          :model-value="publicFileHash as string || ''"
          is-copyable
          readonly
        />
        <app-button preset="primary" @click="reset">
          {{ $t('doc-creation-form.reset-button-text') }}
        </app-button>
      </div>
      <div v-else-if="isFailureShown" class="doc-creation-form__container">
        <file-field :model-value="form.files" readonly />
        <div class="doc-creation-form__note doc-creation-form__note--error">
          <icon
            class="doc-creation-form__note-icon"
            :name="$icons.exclamationCircle"
          />
          <p v-if="errorMessage">
            {{ errorMessage }}
          </p>
        </div>
        <app-button preset="primary" @click="reset">
          {{ $t('doc-creation-form.reset-button-text') }}
        </app-button>
      </div>
      <div v-else class="doc-creation-form__container">
        <file-field v-model="form.files" />
        <transition name="fade-in">
          <div v-show="form.files" class="doc-creation-form__container">
            <div class="doc-creation-form__checkboxes">
              <checkbox-field
                v-model="form.isSign"
                :label="$t('doc-creation-form.checkbox-is-sign')"
              />
              <checkbox-field
                v-model="form.isIndicatingAddresses"
                :label="
                  $t('doc-creation-form.checkbox-is-indicating-addresses')
                "
              />
            </div>
            <p class="doc-creation-form__fee">
              {{ $t('doc-creation-form.fee-title') }}
              <span class="doc-creation-form__fee-value">
                {{ formatFee(fee) }}
              </span>
            </p>
            <transition name="fade-in">
              <div
                v-show="form.isIndicatingAddresses"
                class="doc-creation-form__container"
              >
                <input-field
                  v-model="walletAddress"
                  :label="$t('doc-creation-form.wallets-addresses-title')"
                  :placeholder="
                    $t('doc-creation-form.wallet-address-placeholder')
                  "
                />
                <transition-group name="fade">
                  <textarea-field
                    v-for="address in form.indicatedAddresses"
                    :key="address"
                    :model-value="address"
                    @clear="removeIndicatedAddress(address)"
                    is-removable
                    readonly
                  />
                </transition-group>
              </div>
            </transition>
          </div>
        </transition>
        <div class="doc-creation-form__buttons">
          <app-button preset="outline-brittle" @click="emit('cancel')">
            {{ $t('doc-creation-form.cancel-button-text') }}
          </app-button>
          <app-button
            preset="primary"
            :disabled="isSubmitButtonDisabled"
            @click="submit"
          >
            {{ $t('doc-creation-form.submit-button-text') }}
          </app-button>
        </div>
      </div>
    </transition>
  </form>
</template>

<script lang="ts" setup>
import { Icon, AppButton, Spinner } from '@/common'
import {
  useContext,
  useForm,
  useFormValidation,
  useTimestampContract,
  usePoseidonHashContract,
} from '@/composables'
import { RPC_ERROR_MESSAGES } from '@/enums'
import { errors } from '@/errors'
import { FileField, TextareaField, CheckboxField, InputField } from '@/fields'
import {
  ErrorHandler,
  getKeccak256FileHash,
  isAddress,
  generateZKPPointsStructAndPublicHash,
  formatEther,
  getCurrencySymbolByChainId,
} from '@/helpers'
import { required, maxValue, requiredIf } from '@/validators'
import {
  Keccak256Hash,
  PoseidonHash,
  BytesLike,
  ChainId,
  BigNumber,
} from '@/types'
import { useWeb3ProvidersStore } from '@/store'
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

import { db, storage } from "@/firebase"; // Adjust the path to your firebase.js

const emit = defineEmits<{
  (event: 'cancel'): void
}>()
const signerAddress = ref('');

const { $t } = useContext()
const web3Store = useWeb3ProvidersStore()


const timestampContractInstance = useTimestampContract()
const poseidonHashContractInstance = usePoseidonHashContract()

const {
  isFormDisabled,
  isSubmitting,
  isConfirmationShown,
  isFailureShown,
  showConfirmation,
  showFailure,
  disableForm,
  enableForm,
} = useForm()

const isInitializing = ref(true)
const fee = ref<BigNumber | null>()
const publicFileHash = ref<BytesLike | null>(null)
const walletAddress = ref('')
const errorMessage = ref('')

const form = reactive({
  files: null as File[] | null,
  isSign: true,
  isIndicatingAddresses: false,
  indicatedAddresses: [] as string[],
})

const { isFieldsValid } = useFormValidation(form, {
  files: {
    0: {
      required,
      size: {
        required,
        maxValue: maxValue(2 * 1000 * 1000),
      },
    },
  },
  indicatedAddresses: {
    required: requiredIf(() => form.isIndicatingAddresses),
    // TODO: simple string[] array validation
  },
})
const getSignerAddress = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  signerAddress.value = accounts[0];
};

const addIndicatedAddress = (address: string) => {
  if (isAddress(address) && !form.indicatedAddresses.includes(address)) {
    form.indicatedAddresses.unshift(
      address.startsWith('0x') ? address : `0x${address}`,
    )

    nextTick(() => (walletAddress.value = ''))
  }
}
addIndicatedAddress(web3Store.provider.selectedAddress as string)
watch(
  () => walletAddress.value,
  newValue => addIndicatedAddress(newValue),
)

const removeIndicatedAddress = (address: string) => {
  form.indicatedAddresses = form.indicatedAddresses.filter(
    indicatedAddress => indicatedAddress !== address,
  )
}

const getErrorMessage = (err: unknown): string => {
  switch (true) {
    case err?.reason === RPC_ERROR_MESSAGES.hashCollision:
      return $t('doc-creation-form.error-hash-collision')
    case err?.constructor === TypeError:
      return $t('doc-creation-form.error-failed-to-fetch')
    default:
      return $t('doc-creation-form.error-default')
  }
}

const formatFee = (fee?: BigNumber | null) => {
  if (!fee) return ''
  return `${formatEther(fee)} ${getCurrencySymbolByChainId(
    web3Store.provider.chainId as ChainId,
  )}`.replace('.', ',')
}

const isSubmitButtonDisabled = computed<boolean>(
  () =>
    isFormDisabled.value ||
    !isFieldsValid.value ||
    !web3Store.provider.isConnected ||
    !web3Store.isValidChain,
)


const submit = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    const file = form.files?.[0];
    const fileRef = storageRef(storage, `documents/${file.name}`);
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);
    const walletAddress = web3Store.provider.selectedAddress as string;
    const userDocRef = doc(db, 'users', walletAddress);
    const userDocSnapshot = await getDoc(userDocRef);
    if (!userDocSnapshot.exists()) {
      throw new Error("User not found in Firestore");
    }
    const { userType } = userDocSnapshot.data();
    const secretFileHash = (await poseidonHashContractInstance.getPoseidonHash(
      (await getKeccak256FileHash(form.files?.[0] as File)) as Keccak256Hash,
    )) as PoseidonHash
    const { ZKPPointsStruct, publicHash } =
      await generateZKPPointsStructAndPublicHash(
        secretFileHash,
        web3Store.provider.selectedAddress as string,
      )
    publicFileHash.value = publicHash
    await timestampContractInstance.createStamp(
      publicFileHash.value,
      form.isSign,
      form.isIndicatingAddresses ? form.indicatedAddresses.reverse() : [],
      ZKPPointsStruct,
      {
        value: fee.value as BigNumber,
      },
    )
    const fileMetadata = {
      fileName: file.name,
      fileHash: publicHash,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      uploaderAddress: walletAddress,
      indicatedAddresses: [...form.indicatedAddresses],
      uploadType: userType, 
      isVerified: false,
      fileUrl: fileUrl,
    };
    await setDoc(doc(db, 'files', publicHash), fileMetadata);

    
    showConfirmation()
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
    if (err?.code !== errors.ACTION_REJECTED) showFailure()
    ErrorHandler.processWithoutFeedback(err)
  }
  isSubmitting.value = false
  enableForm()
}

const reset = () => {
  errorMessage.value = ''
  publicFileHash.value = null

  form.files = null
  form.isSign = true
  form.isIndicatingAddresses = false
  form.indicatedAddresses = []

  isInitializing.value = false
  isConfirmationShown.value = false
  isFailureShown.value = false
  isFormDisabled.value = false
}

onMounted(async () => {
  try {
    fee.value = await timestampContractInstance.getFee()
  } catch (error) {
    ErrorHandler.process(error)
    emit('cancel')
  }

  isInitializing.value = false
})
</script>

<style lang="scss" scoped>
.doc-creation-form__container {
  display: flex;
  flex-direction: column;
  gap: toRem(24);

  @include respond-to(tablet) {
    gap: toRem(16);
  }
}

.doc-creation-form__checkboxes {
  display: flex;
  gap: toRem(24);

  @include respond-to(tablet) {
    flex-direction: column;
    gap: toRem(16);
  }
}

.doc-creation-form__fee {
  display: flex;
  gap: toRem(11);

  @include respond-to(tablet) {
    gap: toRem(4);
  }

  @include body-large;
}

.doc-creation-form__fee-value {
  font-family: inherit;
  font-weight: inherit;
  font-size: inherit;
  line-height: inherit;
  color: var(--col-primary);
}

.doc-creation-form__buttons {
  display: flex;
  gap: toRem(16);

  @include respond-to(tablet) {
    gap: toRem(8);
  }
}

.doc-creation-form__please-wait-msg {
  text-align: center;
}

.doc-creation-form__note {
  &--success {
    @include note-success;
  }

  &--error {
    @include note-error;
  }

  @include note;
}

.doc-creation-form__note-icon {
  height: toRem(24);
  width: toRem(24);
  flex-shrink: 0;
  color: var(--col-intense);

  @include respond-to(tablet) {
    height: toRem(20);
    width: toRem(20);
  }
}

.fade-in-leave-active {
  display: none;
}

.fade-leave-active {
  animation: fade-in ease-out var(--transition-duration) reverse;
}

.fade-in-enter-active,
.fade-enter-active {
  animation: fade-in ease-out var(--transition-duration-slow);
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
