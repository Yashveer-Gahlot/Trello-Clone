import React, { useEffect } from 'react';
import useBoardStore from '../../store/useBoardStore';
import List from './List';
import AddListForm from './AddListForm';
import { Plus, Layout } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

const BoardCanvas = () => {
  const { lists, board, fetchBoardData, isLoading, error } = useBoardStore();

  useEffect(() => {
    // Dispatch fetchBoardData to hit the backend API on load.
    fetchBoardData();
  }, [fetchBoardData]);

  // Handle the end of a drag event
  const handleDragEnd = (result) => {
    // We get the new async action from the store and call it
    const { moveItemLocally } = useBoardStore.getState();
    moveItemLocally(result);
  };

  if (isLoading) {
    return (
      <main className="flex-1 w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center text-red-300">
        <div className="bg-red-900/50 p-6 rounded-xl text-center border border-red-500/30">
          <h2 className="text-xl font-bold mb-2">Error Loading Board</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  // Define an empty state or the main board view
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <main className="flex-1 w-full relative">
        {lists.length === 0 ? (
          // Perfectly centered empty state
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
             <div className="w-24 h-24 mb-6 text-white/20 bg-white/5 rounded-3xl flex items-center justify-center shadow-inner">
               <Layout size={48} />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Your Board is Empty</h2>
             <p className="text-white/60 max-w-md mb-8">
               There are no lists or cards here. Start building your workflow.
             </p>
             <button className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-6 py-3 font-medium transition-colors shadow-lg flex items-center gap-2">
               <Plus size={18} />
               Add your first list
             </button>
          </div>
        ) : (
          // Droppable Container for Lists (Horizontal matching Trello's exact look)
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div 
                className="flex h-full items-start gap-4 overflow-x-auto overflow-y-hidden p-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {lists.map((list, index) => (
                  <div key={list.id} className="shrink-0 h-full">
                    <List list={list} index={index} />
                  </div>
                ))}
                
                {provided.placeholder}

                {/* Add another list form */}
                <AddListForm />
              </div>
            )}
          </Droppable>
        )}
      </main>
    </DragDropContext>
  );
};

export default BoardCanvas;
