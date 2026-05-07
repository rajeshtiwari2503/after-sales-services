import { create } from "zustand";
interface AuthState {
user: any;
token: string | null;
setAuth: (data: any) => void;
logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
user: null,
token: null,
setAuth: (data) =>
set({
user: data.user,
token: data.token,
}),
logout: () =>
set({
user: null,
token: null,
}),
}));
