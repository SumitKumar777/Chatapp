import { create } from "zustand";

interface UserUtilsProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

const userUtils = create<UserUtilsProps>((set) => ({
  isSidebarOpen: true,
  setIsSidebarOpen: (value: boolean) => set(() => ({ isSidebarOpen: value })),
}));

export default userUtils;
