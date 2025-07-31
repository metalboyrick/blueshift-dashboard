import React, { useCallback, useState } from "react";
import Button from "../Button/Button";
import DecryptedText from "../HeadingReveal/DecryptText";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { anticipate } from "motion";
import Icon from "../Icon/Icon";

interface WalletButtonProps {
  disabled?: boolean;
}

export default function WalletMultiButton({
  disabled = false,
}: WalletButtonProps) {
  const [isHoveringLocal, setIsHoveringLocal] = useState<boolean>(false);
  const {
    status,
    publicKey,
    login,
    logout,
    isLoggingIn,
    isLoggingOut,
  } = useAuth();
  const address = publicKey?.toBase58();

  const showDisconnectOverlay = isHoveringLocal && status === "signed-in";

  const getButtonLabel = useCallback(() => {
    if (status === "signing-in") return "Signing In...";
    if (status === "signed-in" && address) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    return "Connect Wallet";
  }, [address, status]);

  const buttonLabel = getButtonLabel();

  const handleClick = useCallback(() => {
    if (status === "signed-in") {
      logout();
    } else {
      login();
    }
  }, [status, login, logout]);

  return (
    <div
      onMouseEnter={() => setIsHoveringLocal(true)}
      onMouseLeave={() => setIsHoveringLocal(false)}
      className="relative"
    >
      <Button
        disabled={disabled || isLoggingIn || isLoggingOut}
        label={buttonLabel}
        icon="Wallet"
        variant="primary"
        className="overflow-hidden"
        onClick={handleClick}
      />
      {showDisconnectOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/5 backdrop-blur-[8px] rounded-xl">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: anticipate }}
            className="flex items-center gap-x-1.5 font-mono text-[15px] font-medium leading-none text-black"
          >
            <Icon name="Disconnect" />
            <DecryptedText isHovering={isHoveringLocal} text="Disconnect" />
          </motion.span>
        </div>
      )}
    </div>
  );
}
