import React from 'react';
import { Share2, Filter, User, ChevronDown, MoreHorizontal } from 'lucide-react';

const TopNavbar = () => {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-black/20 backdrop-blur-sm text-white">
      {/* Left side - Board Info */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-wide">Trello Clone</h1>
        <div className="h-4 w-[1px] bg-white/30 hidden md:block"></div>
        <button className="flex items-center gap-1 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-lg font-semibold">
          Project Alpha
          <ChevronDown size={18} className="text-white/70" />
        </button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-sm font-medium">
          <Filter size={16} />
          <span className="hidden md:inline">Filters</span>
        </button>
        <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-sm font-medium">
          <Share2 size={16} />
          <span className="hidden md:inline">Share</span>
        </button>
        <div className="h-4 w-[1px] bg-white/30 hidden md:block"></div>
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors">
          <MoreHorizontal size={20} />
        </button>
        <button className="bg-indigo-600 hover:bg-indigo-700 p-1.5 rounded-full transition-colors">
          <User size={18} className="text-white" />
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
