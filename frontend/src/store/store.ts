import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { UserState } from "../types";

const useStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			setUser: (user) => set({ user }),
			logout: () => set({ user: null }),

			// Add more functions as needed to manage the user state
		}),
		{
			name: "userData",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

export default useStore;
