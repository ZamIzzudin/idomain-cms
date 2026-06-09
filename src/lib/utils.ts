/** @format */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function lastPathname(path: string) {
  if (!path) return "";
  return path.split("/")[path.split("/").length - 1];
}

export const cookies = (() => {
  function get(name: string) {
    const cname = name + "=";
    const allCookies = document.cookie.split(";");
    for (let index = 0; index < allCookies.length; index++) {
      let cookie = allCookies[index];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cname) === 0) {
        return cookie.substring(cname.length, cookie.length);
      }
    }
    return null;
  }

  function add(name: string, data: string, xday = 1) {
    const d = new Date();
    d.setTime(d.getTime() + xday * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + data + ";" + expires + ";path=/";
  }

  function remove(name: string) {
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  return { get, add, remove };
})();
