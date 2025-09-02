import Button, { ButtonVariant } from "../Button/Button";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";
import useMintNFT from "@/hooks/useMintNFT";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import Icon from "../Icon/Icon";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type ChallengesFooterProps = {
  challenge: ChallengeMetadata;
  setIsNFTViewerOpen: (isOpen: boolean) => void;
  setSelectedChallenge: (challenge: ChallengeMetadata) => void;
};

export default function ChallengesFooter({
  challenge,
  setIsNFTViewerOpen,
  setSelectedChallenge,
}: ChallengesFooterProps) {
  const t = useTranslations();
  const challengeTitle = t(`challenges.${challenge.slug}.title`);
  const {locale} = useParams(); 
  const { challengeStatuses } = usePersistentStore();
  const status = challengeStatuses[challenge.slug];
  const { view } = usePersistentStore();
  const { mint, isLoading } = useMintNFT();
  const auth = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleMint = async () => {
    mint(challenge).catch((error) => {
      console.error("Error minting NFT:", error);
    });
  };

  return (
    <div
      className={classNames(
        "relative z-10 flex",
        view === "list" &&
          "ml-auto flex-col items-end gap-y-2.5 justify-center",
        view === "grid" && "w-full justify-between items-end",
      )}
    >
      {status === "open" && (
        <div className="flex flex-col items-center gap-6 w-full">
          <Link
            href={`/challenges/${challenge.slug}`}
            className="text-brand-secondary hover:text-brand-primary transition font-medium !w-full !min-w-[150px]"
          >
            <Button
              variant={challenge.language.toLowerCase() as ButtonVariant}
              size="md"
              label={t("lessons.take_challenge")}
              icon="Challenge"
              className="!w-full"
              iconSide="left"
            />
          </Link>
          <div className="flex items-center gap-x-2">
            <button
              className="flex items-center gap-x-3 text-xs text-tertiary/50 cursor-not-allowed w-full flex-shrink uppercase"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isHovered ? "complete" : "share"}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.1 }}
                  className="flex items-center gap-x-3"
                >
                  <Icon name={isHovered ? "Locked" : "X"} size={12} />
                  <span>
                    {isHovered ? t("ChallengeCenter.complete_to_share") : t("ChallengePage.share_on_x")}
                  </span>
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      )}
      {status === "completed" && !auth.isLoggedIn && (
        <span className="text-tertiary font-medium gap-x-1.5 flex items-center">
          <Icon name="Locked" />
          {t("ChallengeCenter.locked_description")}
        </span>
      )}
      {status === "completed" && auth.isLoggedIn && (
        <Button
          variant="primary"
          size="md"
          label={
            isLoading ? t("ChallengePage.minting") : t("ChallengeCenter.claim")
          }
          icon="Claim"
          iconSide="right"
          className="!w-full !min-w-[150px]"
          onClick={handleMint}
          disabled={isLoading}
        />
      )}
      {status === "claimed" && (
        <div className="flex flex-col items-center gap-6 w-full">
          <Button
            variant="primary"
            size="md"
            label={t("ChallengeCenter.view_nft")}
            icon="Link"
            iconSide="right"
            className="!w-full !min-w-[150px]"
            onClick={() => {
              setIsNFTViewerOpen(true);
              setSelectedChallenge(challenge);
            }}
          />
          <Link
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(`I just completed the ${challengeTitle} challenge from @blueshift_gg.\n\nYou should try it out!\n\nnMake the shift. Build on @solana.\n\nhttps://learn.blueshift.gg/${locale}/challenges/${challenge.slug}`)}`}
            target="_blank"
            className="w-full"
          >
            <Button
              label={t("ChallengePage.share_on_x")}
              variant="link"
              size="sm"
              icon="X"
              iconSize={12}
              className="!w-full !flex-shrink !text-xs !text-tertiary !gap-x-3"
            />
          </Link>
        </div>
      )}
    </div>
  );
}
