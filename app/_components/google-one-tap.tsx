"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const GSI_SRC = "https://accounts.google.com/gsi/client";

type Props = {
  /** Redirect path after successful sign-in (e.g. from ?next=). */
  redirectTo?: string;
  /** If true, do not show the One Tap prompt (e.g. on login page to avoid duplicate UX). */
  disabled?: boolean;
};

/**
 * Google One Tap (Fast Login): loads Google Identity Services and shows the One Tap
 * prompt when the user is not signed in. On success, signs in with Supabase via
 * signInWithIdToken and redirects.
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set.
 */
export function GoogleOneTap({ redirectTo = "/", disabled = false }: Props) {
  const handled = useRef(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || disabled) return;

    function loadScript(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (typeof document === "undefined") {
          reject(new Error("No document"));
          return;
        }
        const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = GSI_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google GSI"));
        document.head.appendChild(script);
      });
    }

    async function init() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) return;

      await loadScript();
      const g = (window as unknown as { google?: { accounts?: { id?: { initialize: (c: unknown) => void; prompt: () => void } } } }).google;
      if (!g?.accounts?.id) return;

      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (handled.current || !response?.credential) return;
          handled.current = true;
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });
          if (!error) {
            const url = redirectTo.startsWith("/") ? `${window.location.origin}${redirectTo}` : redirectTo;
            window.location.href = url;
          }
        },
        cancel_on_tap_outside: true,
      });
      g.accounts.id.prompt();
    }

    init();
  }, [redirectTo, disabled]);

  return null;
}
