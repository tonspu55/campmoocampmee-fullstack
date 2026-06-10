"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useWishlistStore } from "@/lib/wishlist-store";

export default function WishlistInitializer() {
  const { data: session } = authClient.useSession();
  const fetchFavorites = useWishlistStore((state) => state.fetchFavorites);

  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session, fetchFavorites]);

  return null;
}
