"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // localStorage se user info
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return { user, initials, greeting: greeting() };
}


// // useUser.ts — current user profile + update
// import { useState, useEffect, useCallback } from "react";
// import { useSession } from "next-auth/react";

// export interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   role: string;
//   avatar?: string;
//   isActive: boolean;
//   brandId?: string;
//   serviceCenterId?: string;
//   permissions: string[];
//   createdAt: string;
// }

// interface UseUserReturn {
//   user: UserProfile | null;
//   loading: boolean;
//   error: string | null;
//   updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
//   uploadAvatar: (file: File) => Promise<string | null>;
//   refresh: () => void;
// }

// export function useUser(): UseUserReturn {
//   const { data: session, update: updateSession } = useSession();
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchUser = useCallback(async () => {
//     if (!session?.user?.id) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/users/${session.user.id}`);
//       const data = await res.json();
//       if (data.success) setUser(data.data);
//       else throw new Error(data.error);
//     } catch (err) {
//       setError((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   }, [session?.user?.id]);

//   useEffect(() => { fetchUser(); }, [fetchUser]);

//   const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
//     if (!session?.user?.id) return false;
//     try {
//       const res = await fetch(`/api/users/${session.user.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updates),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setUser((prev) => prev ? { ...prev, ...data.data } : data.data);
//         // Sync name/avatar to next-auth session
//         if (updates.name || updates.avatar) {
//           await updateSession({ name: updates.name, image: updates.avatar });
//         }
//         return true;
//       }
//       return false;
//     } catch {
//       return false;
//     }
//   };

//   const uploadAvatar = async (file: File): Promise<string | null> => {
//     const fd = new FormData();
//     fd.append("file", file);
//     fd.append("folder", "avatars");
//     try {
//       const res = await fetch("/api/uploads", { method: "POST", body: fd });
//       const data = await res.json();
//       if (data.success) {
//         await updateProfile({ avatar: data.url });
//         return data.url;
//       }
//       return null;
//     } catch {
//       return null;
//     }
//   };

//   return { user, loading, error, updateProfile, uploadAvatar, refresh: fetchUser };
// }