"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/lib/wishlist-store";

export default function WishlistInitializer() {
  const { data: session } = useSession();
  const fetchFavorites = useWishlistStore((state) => state.fetchFavorites);

  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session, fetchFavorites]);

  return null;
}
