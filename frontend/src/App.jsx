import React from 'react';
import TopNavbar from './components/layout/TopNavbar';
import BottomNav from './components/layout/BottomNav';
import BoardCanvas from './components/board/BoardCanvas';
import CardModal from './components/board/CardModal';
import useBoardStore from './store/useBoardStore';

function App() {
  const boardBackground = useBoardStore((state) => state.boardBackground);
  
  // Determine if background is a URL or a Tailwind class
  const isImage = boardBackground.startsWith('http');
  const bgStyle = isImage 
    ? { backgroundImage: `url(${boardBackground})` } // Size and position handled by tailwind classes below
    : {};
  const bgClass = isImage 
    ? 'bg-cover bg-center bg-no-repeat bg-fixed w-full h-full' 
    : boardBackground;

  return (
    <>
      <div 
        className={`h-screen w-full flex flex-col overflow-hidden text-white transition-all duration-300 ${bgClass}`}
        style={bgStyle}
      >
        <TopNavbar />
        
        {/* Main Board Content Area */}
        <BoardCanvas />

        <BottomNav />
      </div>

      {/* Card Detail Modal - renders above everything when activeCard is set */}
      <CardModal />
    </>
  );
}

export default App;

