import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ScanState, ScanResult } from "../types/zap-scan";

const useScanStore = create<ScanState>()(
	persist(
		(set) => ({
			scanResponse: {} as ScanResult,
			setScanResponse: (scanResponse: ScanResult) =>
				set((state) => ({ ...state, scanResponse })),
		}),
		{
			name: "scanData",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

export default useScanStore;
