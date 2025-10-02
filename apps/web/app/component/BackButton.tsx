"use client";

import { ArrowLeft } from "lucide-react";
import userUtils from "../store/hooks/userUtils";

function BackButton() {

   const setSidebarState=userUtils((state)=>state.setSidebarState);
   return (
			<div className=" pl-2 md:hidden" onClick={()=>setSidebarState(false)}>
				<ArrowLeft  size={40} className="" />
			</div>
		);
}

export default BackButton;