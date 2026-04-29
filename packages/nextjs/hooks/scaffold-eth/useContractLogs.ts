import { useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Address, Log } from "viem";
import { usePublicClient } from "wagmi";

export const useContractLogs = (address: Address) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const { targetNetwork } = useTargetNetwork();
  const client = usePublicClient({ chainId: targetNetwork.id });

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      if (!client) return;
      try {
        const existingLogs = await client.getLogs({
          address: address,
          fromBlock: 0n,
          toBlock: "latest",
        });
        if (!cancelled) setLogs(existingLogs);
      } catch (error) {
        if (!cancelled) console.debug("Contract logs initial fetch transient error:", error);
      }
    };
    fetchLogs();

    const unwatch = client?.watchBlockNumber({
      onBlockNumber: async (_blockNumber, prevBlockNumber) => {
        if (prevBlockNumber === undefined) return;
        try {
          const newLogs = await client.getLogs({
            address: address,
            fromBlock: prevBlockNumber,
            toBlock: "latest",
          });
          if (!cancelled) setLogs(prevLogs => [...prevLogs, ...newLogs]);
        } catch (error) {
          console.debug("Contract logs refresh transient error:", error);
        }
      },
    });

    return () => {
      cancelled = true;
      unwatch?.();
    };
  }, [address, client]);

  return logs;
};
