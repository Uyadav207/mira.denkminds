import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { UserState } from "../types";

const useStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			setUser: (user) => set({ user }),
			setToken: (token) => set({ token }),
			logout: () => set({ user: null, token: null }),
		}),
		{
			name: "userData",
			storage: createJSONStorage(() => sessionStorage), 
		},
	),
);

export default useStore;
