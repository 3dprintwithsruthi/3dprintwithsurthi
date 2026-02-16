"use client";

/**
 * Renders Navbar only when not on login or register (no navbar on auth pages)
 */
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

const HIDE_NAVBAR_PATHS = ["/login", "/register"];

export function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname && HIDE_NAVBAR_PATHS.includes(pathname)) return null;
  return <Navbar />;
}
