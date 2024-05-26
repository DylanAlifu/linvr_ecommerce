"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import CartModal from "./CartModal";
import Cookies from "js-cookie";
import { useWixClient } from "@/hooks/useWixClient";
import { useCartStore } from "@/hooks/useCartStore";

const NavIcons = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const wixClient = useWixClient();
  const isLoggedIn = wixClient.auth.loggedIn();

  const handleProfile = () => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setIsProfileOpen((prev) => !prev);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    Cookies.remove("refreshToken");
    const { logoutUrl } = await wixClient.auth.logout(window.location.href);
    setIsLoading(false);
    setIsProfileOpen(false);
    router.push(logoutUrl);
  };

  const { cart, counter, getCart } = useCartStore();

  useEffect(() => {
    getCart(wixClient);
  }, [wixClient, getCart]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target as Node) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target as Node)
      ) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCartClick = () => {
    setIsCartOpen((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-4 xl:gap-6 relative">
      <Image
        src="/profile.png"
        alt=""
        width={22}
        height={22}
        className="cursor-pointer"
        onClick={handleProfile}
      />

      {isProfileOpen && (
        <div className="absolute p-4 rounded-md top-12 bg-white left-0 text-sm shadow-[0_3px_10px_rgb(0,0,0,0.2)] z-20">
          <Link href="/">Profile</Link>
          <div className="mt-2 cursor-pointer" onClick={handleLogout}>
            {isLoading ? "Logging out" : "Logout"}
          </div>
        </div>
      )}

      <Image
        src="/notification.png"
        alt=""
        width={22}
        height={22}
        className="cursor-pointer"
      />

      <div className="relative" ref={cartButtonRef}>
        <div
          className="cursor-pointer relative"
          onClick={handleCartClick}
        >
          <Image src="/cart.png" alt="" width={22} height={22} />
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-notification_red rounded-full text-white flex items-center justify-center">
            {counter}
          </div>
        </div>
        {isCartOpen && (
          <div ref={cartRef} className="absolute top-0 right-0 z-20">
            <CartModal />
          </div>
        )}
      </div>
    </div>
  );
};

export default NavIcons;
