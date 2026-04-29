"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, isAddress } from "viem";
import { hardhat } from "viem/chains";
import { usePublicClient } from "wagmi";

export const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const client = usePublicClient({ chainId: hardhat.id });
  const normalizedSearch = searchInput.trim();
  const isTxHash = /^0x[a-fA-F0-9]{64}$/.test(normalizedSearch);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isTxHash) {
      try {
        const txHash = normalizedSearch as Hash;
        const tx = await client?.getTransaction({ hash: txHash });
        if (tx) {
          router.push(`/blockexplorer/transaction/${txHash}`);
          return;
        }
      } catch (error) {
        console.debug("Transaction lookup transient error:", error);
      }
    }

    if (isAddress(normalizedSearch)) {
      router.push(`/blockexplorer/address/${normalizedSearch}`);
      return;
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center justify-end mb-5 space-x-3 mx-5">
      <input
        className="border-primary bg-base-100 text-base-content placeholder:text-base-content/50 p-2 mr-2 w-full md:w-1/2 lg:w-1/3 rounded-md shadow-md focus:outline-hidden focus:ring-2 focus:ring-accent"
        type="text"
        value={searchInput}
        placeholder="Search by hash or address"
        onChange={e => setSearchInput(e.target.value)}
      />
      <button className="btn btn-sm btn-primary" type="submit">
        Search
      </button>
    </form>
  );
};
