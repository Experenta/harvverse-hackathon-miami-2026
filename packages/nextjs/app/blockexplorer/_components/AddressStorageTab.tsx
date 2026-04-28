"use client";

import { useEffect, useState } from "react";
import { Address, toHex } from "viem";
import { usePublicClient } from "wagmi";

const MAX_STORAGE_SLOTS = 256;
const EMPTY_SLOT_BREAK_STREAK = 8;

export const AddressStorageTab = ({ address }: { address: Address }) => {
  const [storage, setStorage] = useState<string[]>([]);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    let cancelled = false;

    const fetchStorage = async () => {
      try {
        const storageData = [];
        let emptyStreak = 0;
        let idx = 0;

        while (idx < MAX_STORAGE_SLOTS) {
          const storageAtPosition = await publicClient.getStorageAt({
            address: address,
            slot: toHex(idx),
          });

          if (storageAtPosition === "0x" + "0".repeat(64)) {
            emptyStreak += 1;
            if (emptyStreak >= EMPTY_SLOT_BREAK_STREAK) break;
            idx++;
            continue;
          }

          if (storageAtPosition) {
            storageData.push(storageAtPosition);
            emptyStreak = 0;
          }

          idx++;
        }

        if (!cancelled) setStorage(storageData);
      } catch (error) {
        if (!cancelled) console.debug("Storage lookup transient error:", error);
      }
    };

    fetchStorage();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient]);

  return (
    <div className="flex flex-col gap-3 p-4">
      {storage.length > 0 ? (
        <div className="mockup-code overflow-auto max-h-[500px]">
          <pre className="px-5 whitespace-pre-wrap break-words">
            {storage.map((data, i) => (
              <div key={i}>
                <strong>Storage Slot {i}:</strong> {data}
              </div>
            ))}
          </pre>
        </div>
      ) : (
        <div className="text-lg">This contract does not have any variables.</div>
      )}
    </div>
  );
};
