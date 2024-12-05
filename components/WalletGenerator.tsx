import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Grid2X2, List, Trash } from "lucide-react";
import { toast } from "sonner";
import nacl from "tweetnacl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { ethers } from "ethers";
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface Wallet {
  publicKey: string;
  privateKey: string;
  mnemonic: string;
  path: string;
}

export function WalletGenerator() {
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(" "));
  const [pathTypes, setPathTypes] = useState<string[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [mnemonicInput, setMnemonicInput] = useState<string>("");
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
  const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);
  const [gridView, setGridView] = useState<boolean>(false);
  const pathTypeNames: { [key: string]: string } = {
    "501": "Solana",
    "60": "Ethereum",
  };
  const pathTypeName = pathTypeNames[pathTypes[0]] || "";

  useEffect(() => {
    const storedWallets = localStorage.getItem("wallets");
    const storedMnemonic = localStorage.getItem("mnemonics");
    const storedPathTypes = localStorage.getItem("paths");

    if (storedWallets && storedMnemonic && storedPathTypes) {
      setMnemonicWords(JSON.parse(storedMnemonic));
      setWallets(JSON.parse(storedWallets));
      setPathTypes(JSON.parse(storedPathTypes));
      setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
      setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
    }
  }, []);

  const handleDeleteWallet = (index: number) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);

    setWallets(updatedWallets);
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
    setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));
    toast.success("Wallet deleted successfully!");
  };

  const handleClearWallets = () => {
    localStorage.removeItem("wallets");
    localStorage.removeItem("mnemonics");
    setWallets([]);
    setMnemonicWords([]);
    setVisiblePrivateKeys([]);
    setVisiblePhrases([]);
    // Keep the last selected path type
    const lastPathType = pathTypes[0];
    setPathTypes([lastPathType]);
    localStorage.setItem("paths", JSON.stringify([lastPathType]));
    toast.success("All wallets cleared.");
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const togglePrivateKeyVisibility = (index: number) => {
    setVisiblePrivateKeys(
      visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const generateWalletFromMnemonic = (
    pathType: string,
    mnemonic: string,
    accountIndex: number
  ): Wallet | null => {
    try {
      const seedBuffer = mnemonicToSeedSync(mnemonic);
      const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
      const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));

      let publicKeyEncoded: string;
      let privateKeyEncoded: string;

      if (pathType === "501") {
        // Solana
        const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
        const keypair = Keypair.fromSecretKey(secretKey);

        privateKeyEncoded = bs58.encode(secretKey);
        publicKeyEncoded = keypair.publicKey.toBase58();
      } else if (pathType === "60") {
        // Ethereum
        const privateKey = Buffer.from(derivedSeed).toString("hex");
        privateKeyEncoded = privateKey;

        const wallet = new ethers.Wallet(privateKey);
        publicKeyEncoded = wallet.address;
      } else {
        toast.error("Unsupported path type.");
        return null;
      }

      return {
        publicKey: publicKeyEncoded,
        privateKey: privateKeyEncoded,
        mnemonic,
        path,
      };
    } catch (error) {
      toast.error("Failed to generate wallet. Please try again.");
      console.log(error);
      return null;
    }
  };

  const handleGenerateWallet = () => {
    let mnemonic = mnemonicInput.trim();

    if (mnemonic) {
      if (!validateMnemonic(mnemonic)) {
        toast.error("Invalid recovery phrase. Please try again.");
        return;
      }
    } else {
      mnemonic = generateMnemonic();
    }

    const words = mnemonic.split(" ");
    setMnemonicWords(words);

    const wallet = generateWalletFromMnemonic(
      pathTypes[0],
      mnemonic,
      wallets.length
    );
    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      setWallets(updatedWallets);
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      localStorage.setItem("mnemonics", JSON.stringify(words));
      localStorage.setItem("paths", JSON.stringify(pathTypes));
      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);
      toast.success("Wallet generated successfully!");
    }
  };

  const handleAddWallet = () => {
    if (!mnemonicWords) {
      toast.error("No mnemonic found. Please generate a wallet first.");
      return;
    }

    const wallet = generateWalletFromMnemonic(
      pathTypes[0],
      mnemonicWords.join(" "),
      wallets.length
    );
    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      setWallets(updatedWallets);
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);
      toast.success("Wallet generated successfully!");
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className="flex flex-col gap-5 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black">
        <h2 className="tracking-tighter text-xl md:text-2xl font-black">Generate New Wallet</h2>
        <Select onValueChange={(value) => setPathTypes([value])}>
          <SelectTrigger className="bg-white dark:bg-black">
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">Ethereum (ETH)</SelectItem>
            <SelectItem value="501">Solana (SOL)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-5 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black">
        <div>
          <div className="flex flex-col gap-2">
            <h1 className="tracking-tighter text-xl md:text-2xl font-black">
              Secret Recovery Phrase
            </h1>

          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              type="password"
              placeholder="Enter your secret phrase (or leave blank to generate)"
              onChange={(e) => setMnemonicInput(e.target.value)}
              value={mnemonicInput}
            />
            <Button size={"lg"} disabled={pathTypes.length === 0} onClick={() => handleGenerateWallet()}>
              {mnemonicInput ? "Add Wallet" : "Generate Wallet"}
            </Button>
          </div>
          <p className="text-red-500 p-2 text-xs md:text-md">
            Note: Save these words in a safe place and do not share them with anyone.
          </p>
        </div>
      </div>
      {mnemonicWords && wallets.length > 0 && (
        <div className="group flex flex-col items-center gap-4 cursor-pointer rounded-lg border border-primary/10 p-8">
          <div className="flex w-full justify-between items-center" onClick={() => setShowMnemonic(!showMnemonic)}>
            <h2 className="text-xl md:text-2xl font-bold tracking-tighter">
              Your Secret Phrase
            </h2>
            <Button
              onClick={() => setShowMnemonic(!showMnemonic)}
              variant="ghost"
            >
              {showMnemonic ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>
          {showMnemonic && (
            <div className="flex flex-col w-full items-center justify-center"
              onClick={() => copyToClipboard(mnemonicWords.join(" "))}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8"
              >
                {mnemonicWords.map((word, index) => (
                  <p
                    key={index}
                    className="md:text-lg bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 rounded-lg p-4"
                  >
                    {word}
                  </p>
                ))}
              </div>
              <div className="text-sm md:text-base text-primary/50 flex w-full gap-2 items-center group-hover:text-primary/80 transition-all duration-300">
                <Copy className="size-4" /> Click Anywhere To Copy
              </div>
            </div>
          )}
        </div>
      )}

      {wallets.length > 0 && (
        <div className="flex flex-col gap-8 mt-6">
          <div className="flex md:flex-row flex-col justify-between w-full gap-4 md:items-center">
            <h2 className="tracking-tighter text-xl md:text-2xl font-extrabold">
              {pathTypeName} Wallet
            </h2>
            <div className="flex gap-2">
              {wallets.length > 1 && (
                <Button
                  variant={"ghost"}
                  onClick={() => setGridView(!gridView)}
                  className="hidden md:block"
                >
                  {gridView ? <Grid2X2 /> : <List />}
                </Button>
              )}
              <Button onClick={() => handleAddWallet()}>Add Wallet</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="self-end">
                    Clear Wallets
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete all wallets?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your wallets and keys from local storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleClearWallets()}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className={`grid ${gridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
            {wallets.map((wallet, index) => (
              <div key={index} className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-secondary/50">
                <div
                  className="flex flex-col w-full gap-2"
                  onClick={() => copyToClipboard(wallet.publicKey)}
                >
                  <span className="text-lg md:text-xl font-bold tracking-tighter">
                    Public Key
                  </span>
                  <p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
                    {wallet.publicKey}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <span className="text-lg md:text-xl font-bold tracking-tighter">
                    Private Key
                  </span>
                  <div className="flex justify-between w-full items-center gap-2">
                    <p
                      onClick={() => copyToClipboard(wallet.privateKey)}
                      className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                    >
                      {visiblePrivateKeys[index]
                        ? wallet.privateKey
                        : "•".repeat(wallet.privateKey.length)}
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => togglePrivateKeyVisibility(index)}
                    >
                      {visiblePrivateKeys[index] ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteWallet(index)}
                >
                  <Trash className="size-4 mr-2" /> Delete Wallet
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
  </div>
  )
}