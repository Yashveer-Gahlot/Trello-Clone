import React, { useEffect } from 'react';
import TopNavbar from './components/layout/TopNavbar';
import BoardCanvas from './components/board/BoardCanvas';
import CardModal from './components/board/CardModal';
import useBoardStore from './store/useBoardStore';

function App() {
  const boardBackground = useBoardStore((state) => state.boardBackground);
  const fetchAllBoards = useBoardStore((state) => state.fetchAllBoards);
  const switchBoard = useBoardStore((state) => state.switchBoard);
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const isLoading = useBoardStore((state) => state.isLoading);

  // On mount: fetch all boards, then load the first one
  useEffect(() => {
    const init = async () => {
      const boards = await fetchAllBoards();
      if (boards.length > 0 && !activeBoardId) {
        switchBoard(boards[0].id);
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine if background is a URL or a Tailwind class
  const isImage = boardBackground.startsWith('http');
  const bgStyle = isImage 
    ? { backgroundImage: `url(${boardBackground})` }
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
      </div>

      {/* Card Detail Modal */}
      <CardModal />
    </>
  );
}

export default App;
