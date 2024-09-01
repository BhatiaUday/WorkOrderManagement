import { utils } from 'ethers'

// EIP-3085
export interface AddEthereumChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

export const Q_MAINNET_NETWORK_CONFIG = Object.freeze({
  chainId: utils.hexValue(35441),
  chainName: 'Q Mainnet',
  nativeCurrency: {
    name: 'Q ',
    symbol: 'Q ',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.q.org'],
  blockExplorerUrls: ['https://explorer.q.org'],
}) as Readonly<AddEthereumChainParameter>

export const Q_TESTNET_NETWORK_CONFIG = Object.freeze({
  chainId: utils.hexValue(35443),
  chainName: 'Q Testnet',
  nativeCurrency: {
    name: 'Q ',
    symbol: 'Q ',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.qtestnet.org'],
  blockExplorerUrls: ['https://explorer.qtestnet.org'],
}) as Readonly<AddEthereumChainParameter>
