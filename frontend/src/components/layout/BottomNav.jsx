import React, { useState } from 'react';
import { Inbox, Calendar, Trello, Repeat } from 'lucide-react';

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState('Board');

  const navItems = [
    { name: 'Inbox', icon: <Inbox size={18} /> },
    { name: 'Planner', icon: <Calendar size={18} /> },
    { name: 'Board', icon: <Trello size={18} /> },
    { name: 'Switch boards', icon: <Repeat size={18} /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center bg-gray-900/90 backdrop-blur-md rounded-full px-2 py-2 shadow-2xl border border-white/10">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              activeTab === item.name
                ? 'bg-blue-600/20 text-blue-400 font-medium'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.icon}
            <span className="text-sm hidden sm:block whitespace-nowrap">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
