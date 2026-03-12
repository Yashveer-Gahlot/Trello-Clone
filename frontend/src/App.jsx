import React from 'react';
import TopNavbar from './components/layout/TopNavbar';
import BottomNav from './components/layout/BottomNav';
import BoardCanvas from './components/board/BoardCanvas';

function App() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 text-white">
      <TopNavbar />
      
      {/* Main Board Content Area */}
      <BoardCanvas />

      <BottomNav />
    </div>
  );
}

export default App;
