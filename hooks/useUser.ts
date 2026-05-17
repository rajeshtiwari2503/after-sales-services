// "use client";

// import { useState, useEffect } from "react";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// export function useUser() {
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     // localStorage se user info
//     const stored = localStorage.getItem("user");
//     if (stored) {
//       try {
//         setUser(JSON.parse(stored));
//       } catch {}
//     }
//   }, []);

//   const initials = user?.name
//     ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
//     : "U";

//   const greeting = () => {
//     const h = new Date().getHours();
//     if (h < 12) return "Good morning";
//     if (h < 17) return "Good afternoon";
//     return "Good evening";
//   };

//   return { user, initials, greeting: greeting() };
// }

 "use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  tenantId?: string;
  isActive?: boolean;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const u = data.data ?? data.user ?? data;
      if (u?.name) {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch {}
  }, []);

  const update = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const isRole = (...roles: string[]) => user ? roles.includes(user.role) : false;

  return { user, loading, initials, greeting, refresh, update, isRole };
}