
import React, { ReactNode, useState } from 'react';

interface TooltipProps{
    text: string,
    children: ReactNode
}

const Tooltip = ({ text, children}: TooltipProps) => {
  return (
    <div className="relative group inline-block">
      {/* The wrapped element */}
      {children}
      
      {/* The Tooltip - initially hidden, visible on hover */}
      <div className="absolute px-3 py-1 bg-black text-white text-xs font-light rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
