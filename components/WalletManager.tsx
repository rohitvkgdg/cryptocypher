'use client'

import React, { useState, useEffect } from 'react'
import { WalletGenerator } from './WalletGenerator'
import { DarkModeToggle } from './DarkModeToggle'
import { Account, Chain, Wallet, generateKeyPhrase, generateWalletAddress } from '../utils/walletUtils'
import { Button } from '@/components/ui/button'

export function WalletManager() {
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading or initialization process
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const createAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      keyPhrase: generateKeyPhrase(),
      wallets: [],
    }
    setAccount(newAccount)
  }

  const generateNewKeyPhrase = () => {
    if (account) {
      setAccount({
        ...account,
        keyPhrase: generateKeyPhrase(),
        wallets: [], // Clear existing wallets as they won't be valid with the new key phrase
      })
    }
  }

  const generateWallet = (chain: Chain) => {
    if (account) {
      const newWallet: Wallet = {
        id: Date.now().toString(),
        chain,
        address: generateWalletAddress(account.keyPhrase, chain),
      }
      setAccount({
        ...account,
        wallets: [...account.wallets, newWallet],
      })
    }
  }

  const deleteWallet = (id: string) => {
    if (account) {
      setAccount({
        ...account,
        wallets: account.wallets.filter((wallet) => wallet.id !== id),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>Loading...</p>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        <h1 className="text-2xl font-bold mb-4">Welcome to CryptoCypher</h1>
        <Button onClick={createAccount}>Create Account</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-10 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex justify-between mb-4">
          <div></div>
          <h1 className="text-4xl font-bold">CryptoCypher</h1>
          <div className="self-end">
          <DarkModeToggle />
          </div>
        </div>
        <WalletGenerator />
        <div className="mt-8">
        </div>
        
      </div>
    </div>
  )
}

