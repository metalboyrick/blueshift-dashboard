"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePersistentStore } from "@/stores/store";
import { useMutation } from "@tanstack/react-query";
import {
  isTokenExpired as isTokenExpiredUtil,
  getPublicKeyFromToken,
} from "@/lib/auth/utils";
import {
  AuthError,
  AuthenticationAPIError,
  NetworkError,
  UserRejectedSignatureError,
  WalletDisconnectError,
} from "@/lib/auth/errors";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { performSignIn, AuthResponse } from "@/lib/auth/api";

type SignMessage = (message: Uint8Array) => Promise<Uint8Array>;

export type AuthStatus =
  | "signed-out"
  | "awaiting-wallet"
  | "signing-in"
  | "signed-in"
  | "signing-out";

/**
 * A hook for managing Solana wallet authentication.
 *
 * This hook encapsulates the entire authentication flow, including:
 * - Connecting to a wallet.
 * - Signing a message to prove ownership.
 * - Exchanging the signature for a JWT from the backend.
 * - Storing the JWT and managing the user's signed-in state.
 * - Handling logout and wallet disconnection.
 *
 * It uses a state machine to track the current authentication status:
 * - `signed-out`: The initial state.
 * - `awaiting-wallet`: The user has initiated login but needs to connect their wallet.
 * - `signing-in`: The message signing and API call are in progress.
 * - `signed-in`: The user is successfully authenticated.
 * - `signing-out`: The logout process is in progress.
 */
export function useAuth() {
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  const { setVisible: setModalVisible, visible: isModalVisible } =
    useWalletModal();
  const { authToken, setAuthToken, clearAuthToken } = usePersistentStore();

  const [status, setStatus] = useState<AuthStatus>("signed-out");
  const [signInError, setSignInError] = useState<AuthError | null>(null);
  const [signOutError, setSignOutError] = useState<AuthError | null>(null);
  const t = useTranslations();

  const isTokenExpired = () => isTokenExpiredUtil(authToken);

  const signInMutation = useMutation<AuthResponse, Error>({
    mutationFn: () => {
      if (!publicKey || !signMessage) {
        throw new Error("Wallet not connected or signMessage not available");
      }
      return performSignIn(publicKey.toBase58(), signMessage);
    },
    onMutate: () => {
      setStatus("signing-in");
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setStatus("signed-in");
    },
    onError: (err) => {
      const authError = err as AuthError;
      setSignInError(authError);
      setStatus("signed-out");

      // Display toast notification
      if (authError instanceof UserRejectedSignatureError) {
        toast.error(t("notifications.errors.user_rejected_signature"));
        disconnect().catch(() => {
          toast.error(t("notifications.errors.auth_generic"));
        });
      } else if (authError instanceof NetworkError) {
        toast.error(t("notifications.errors.network_error"));
      } else if (authError instanceof AuthenticationAPIError) {
        toast.error(t("notifications.errors.auth_unauthorized"));
      } else {
        toast.error(t("notifications.errors.auth_generic"));
      }
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      clearAuthToken();
      if (connected) {
        try {
          await disconnect();
        } catch {
          throw new WalletDisconnectError();
        }
      }
    },
    onMutate: () => {
      setStatus("signing-out");
    },
    onSuccess: () => {
      setStatus("signed-out");
    },
    onError: (err) => {
      const authError = err as AuthError;
      setSignOutError(authError);
      // Still signed-out even if disconnect fails
      setStatus("signed-out");

      // Display toast notification for sign-out failures
      toast.error(t("notifications.errors.auth_generic"));
    },
  });

  const { reset: resetSignInMutation } = signInMutation;
  const { reset: resetSignOutMutation } = signOutMutation;

  const resetAuthState = useCallback(() => {
    resetSignInMutation();
    resetSignOutMutation();
    setSignInError(null);
    setSignOutError(null);
  }, [resetSignInMutation, resetSignOutMutation]);

  const login = useCallback(() => {
    resetAuthState();

    // If we are already in a signing state, don't do anything
    if (
      status === "awaiting-wallet" ||
      status === "signing-in" ||
      status === "signed-in"
    ) {
      return;
    }

    if (connected) {
      // If we are connected to wallet, sign in
      signInMutation.mutate();
    } else {
      // If we are not connected to wallet, show the wallet modal
      setStatus("awaiting-wallet");
      setModalVisible(true);
    }
  }, [status, connected, setModalVisible, signInMutation, resetAuthState]);

  const logout = useCallback(() => {
    resetAuthState();
    if (status === "signing-out") return;
    signOutMutation.mutate();
  }, [status, signOutMutation, resetAuthState]);

  const { isPending: isSigningIn, mutate: doSignIn } = signInMutation;
  const { isPending: isSigningOut } = signOutMutation;

  // This is the primary effect for managing auth status based on external state
  // changes (e.g., wallet connection, token changes, etc.).
  // It acts as a state machine to keep the auth status consistent.
  useEffect(() => {
    // 1. Do nothing if a sign-in or sign-out is already in progress.
    if (isSigningIn || isSigningOut) {
      return;
    }

    // 2. Handle wallet/token mismatches as a high-priority event. This
    // preempts the main state machine to force re-authentication whenever
    // the connected wallet doesn't match the stored token.
    if (connected && authToken && publicKey) {
      const tokenPublicKey = getPublicKeyFromToken(authToken);
      if (tokenPublicKey !== publicKey.toBase58()) {
        clearAuthToken();
        doSignIn();
        return; // Re-authentication is in progress, stop further processing.
      }
    }

    // 3. If there are no mismatches, proceed with the main state machine logic.
    switch (status) {
      case "signed-out":
        // If we have a valid, matching session, transition to signed-in.
        // This handles automatic session restoration.
        if (connected && authToken && !isTokenExpired()) {
          setStatus("signed-in");
        }
        break;
      case "signed-in":
        // If we lose the wallet connection, the token, or the token expires, sign out.
        if (!connected || !authToken || isTokenExpired()) {
          setStatus("signed-out");
        }
        break;
      case "awaiting-wallet":
        // The user initiated a login and is waiting to connect their wallet.
        if (connected) {
          // Wallet is now connected, so proceed with signing.
          doSignIn();
        } else if (!isModalVisible) {
          // The user closed the modal without connecting, so cancel the login.
          setStatus("signed-out");
        }
        break;
      case "signing-in":
      case "signing-out":
        // These are transient states, and this effect is paused while they
        // are active (see guard at the top), so no action is needed here.
        break;
    }
  }, [
    status,
    connected,
    authToken,
    publicKey,
    isModalVisible,
    isSigningIn,
    isSigningOut,
    doSignIn,
    clearAuthToken,
    authToken,
  ]);

  return {
    login,
    logout,
    publicKey,
    authToken,
    isTokenExpired,
    status,

    /* Convenient status flags */
    isLoggedIn: status === "signed-in",
    isLoggingIn: status === "awaiting-wallet" || isSigningIn,
    isLoggingOut: isSigningOut,

    /* Errors */
    signInError,
    signOutError,
  };
}
