import React, { useState } from 'react'
import { Chain } from '../utils/walletUtils'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WalletGeneratorProps {
  keyPhrase: string
  onGenerate: (chain: Chain) => void
}

export function WalletGenerator({ keyPhrase, onGenerate }: WalletGeneratorProps) {
  const [selectedChain, setSelectedChain] = useState<Chain | ''>('')

  const handleGenerate = () => {
    if (selectedChain) {
      onGenerate(selectedChain)
      setSelectedChain('') // Reset the selected chain after generating a wallet
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <h2 className="text-lg font-semibold">Generate New Wallet</h2>
      <Select value={selectedChain} onValueChange={(value) => setSelectedChain(value as Chain)}>
        <SelectTrigger className="bg-white dark:bg-gray-700">
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
          <SelectItem value="SOL">Solana (SOL)</SelectItem>
          <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleGenerate} disabled={!selectedChain}>Generate Wallet</Button>
    </div>
  )
}

