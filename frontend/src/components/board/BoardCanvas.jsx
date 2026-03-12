import React from 'react';
import useBoardStore from '../../store/useBoardStore';
import List from './List';
import AddListForm from './AddListForm';
import { Plus, Layout } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

const BoardCanvas = () => {
  const { lists, board, isLoading, error, filterQuery, filterType } = useBoardStore();

  // Handle the end of a drag event
  const handleDragEnd = (result) => {
    // We get the new async action from the store and call it
    const { moveItemLocally } = useBoardStore.getState();
    moveItemLocally(result);
  };

  // Only filter lists when filterType is 'list'; card filtering is handled inside List.jsx
  const filteredLists = (filterQuery && filterType === 'list')
    ? lists.filter((list) => list.title.toLowerCase().includes(filterQuery.toLowerCase()))
    : lists;

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
      <main className="flex-1 w-full relative z-0">
        {filteredLists.length === 0 ? (
          // Perfectly centered empty state
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
             <div className="w-24 h-24 mb-6 text-white/20 bg-white/5 rounded-3xl flex items-center justify-center shadow-inner">
               <Layout size={48} />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">
               {filterQuery ? 'No lists match your filter' : 'Your Board is Empty'}
             </h2>
             <p className="text-white/60 max-w-md mb-8">
               {filterQuery
                 ? `No lists found matching "${filterQuery}". Try a different search.`
                 : 'There are no lists or cards here. Start building your workflow.'}
             </p>
             {!filterQuery && (
               <div className="flex h-full items-start justify-center pt-10">
                 <AddListForm />
               </div>
             )}
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
                {filteredLists.map((list, index) => (
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
