"use client";

import { ArrowLeft } from "lucide-react";
import userUtils from "../store/hooks/userUtils";

function BackButton() {
  const setIsSidebarOpen = userUtils((state) => state.setIsSidebarOpen);
  return (
    <div className=" pl-2 md:hidden" onClick={() => setIsSidebarOpen(true)}>
      <ArrowLeft size={40} className="" />
    </div>
  );
}

export default BackButton;
