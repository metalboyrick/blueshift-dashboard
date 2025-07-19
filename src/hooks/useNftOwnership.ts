import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { findCertificationPda, findUnitPda } from "@/lib/nft/sdk";

export const useNftOwnership = (challenges: ChallengeMetadata[]) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(true);
  const [ownership, setOwnership] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!publicKey || challenges.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const pdaList = challenges.map((challenge) => {
          const unitPda = findUnitPda(challenge.unitName);
          return findCertificationPda(unitPda, publicKey);
        });

        const accounts = await connection.getMultipleAccountsInfo(pdaList);

        const newOwnership: Record<string, boolean> = {};
        accounts.forEach((account, index) => {
          const challenge = challenges[index];
          newOwnership[challenge.slug] = account !== null;
        });

        setOwnership(newOwnership);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("Error checking NFT ownership:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkOwnership();
  }, [publicKey, challenges, connection]);

  return { loading, ownership, error };
};
