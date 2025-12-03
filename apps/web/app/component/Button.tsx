"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   
   className?:string,
   type?:"button"| "submit"

}


const Button :React.FC<ButtonProps>=({className="",type="button",children,...rest})=>{

   return (
			<button
				type={type}
				className={`px-4 py-2 rounded-md font-medium  ${className}`}
            {...rest}
			>
				{children}
			</button>
		);

}

export default Button;