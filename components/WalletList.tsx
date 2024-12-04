import React from 'react'
import { Wallet } from '../utils/walletUtils'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface WalletListProps {
  wallets: Wallet[]
  onDelete: (id: string) => void
}

export function WalletList({ wallets, onDelete }: WalletListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Wallets</h2>
      {wallets.map((wallet) => (
        <div key={wallet.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div>
            <p className="font-medium">{wallet.chain}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{wallet.address}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(wallet.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

