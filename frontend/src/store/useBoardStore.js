import { create } from 'zustand';
import axios from 'axios';

const useBoardStore = create((set, get) => ({
  board: null,
  lists: [],
  cards: [],
  isLoading: false,
  error: null,

  // Action to fetch board data and normalize it into our state
  fetchBoardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/api/boards');
      const boardData = response.data;

      // Extract lists and cards
      const extractedLists = [];
      const extractedCards = [];

      // Safely destructure and normalize using optional chaining
      if (boardData?.lists) {
        boardData.lists.forEach((list) => {
          // Extract the cards array and remove it from the list object
          const { cards, ...listWithoutCards } = list;
          extractedLists.push(listWithoutCards);

          if (cards && Array.isArray(cards)) {
            extractedCards.push(...cards);
          }
        });
      }

      // Remove the nested lists array from the root board object safely
      const { lists, ...boardWithoutLists } = boardData || {};

      set({
        board: boardWithoutLists,
        lists: boardData?.lists || [],
        cards: extractedCards,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching board data:', error);
      set({ error: error.message || 'Failed to fetch board data', isLoading: false });
    }
  },

  // Action to handle complex local DND reordering and async background saves
  moveItemLocally: async (result) => {
    const { source, destination, type, draggableId } = result;

    if (!destination) return; // Dropped outside the list

    // If dropped in the exact same spot, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const { lists, cards } = get();

    // --- REORDER LISTS ---
    if (type === 'list') {
      const newLists = Array.from(lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);

      // Recalculate positions based on neighbors for the moved list
      let newPosition = 0;
      if (destination.index === 0) {
        // Moved to the very start
        newPosition = newLists.length > 1 ? newLists[1].position / 2 : 1024;
      } else if (destination.index === newLists.length - 1) {
        // Moved to the very end
        newPosition = newLists[newLists.length - 2].position + 1024;
      } else {
        // Moved between two lists
        const prevPos = newLists[destination.index - 1].position;
        const nextPos = newLists[destination.index + 1].position;
        newPosition = (prevPos + nextPos) / 2;
      }

      movedList.position = newPosition;

      // Optimistically update the UI
      set({ lists: newLists });

      // Fire and forget database update
      try {
        await axios.put(`http://localhost:3000/api/lists/${draggableId}/move`, {
          position: newPosition,
          boardId: movedList.boardId, // Needed for standard validation
        });
      } catch (error) {
        console.error('Failed to save list movement to database:', error);
        // In a real app we might revert the state if the save failed
      }
      return;
    }

    // --- REORDER CARDS ---
    if (type === 'card') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;
      
      const newCards = Array.from(cards);
      
      // Find the specific card being moved
      const movedCardIndex = newCards.findIndex(c => c.id === draggableId);
      if (movedCardIndex === -1) return;
      
      const movedCard = newCards[movedCardIndex];

      // Remove the card from the primary flat array
      newCards.splice(movedCardIndex, 1);

      // Get all cards in the destination list, sorted by position, EXCLUDING the dragged card 
      // (in case we're moving within the exact same list, to avoid referencing stale data)
      const visibleDestCards = newCards
        .filter(c => c.listId === destListId && !c.isArchived)
        .sort((a, b) => a.position - b.position);

      // Calculate the new fractional position based on the destination neighbors
      let newPosition = 0;
      if (visibleDestCards.length === 0) {
        // Dropping into an EMPTY list
        newPosition = 1024;
      } else if (destination.index === 0) {
        // Dropping at the very top of a list
        newPosition = visibleDestCards[0].position / 2;
      } else if (destination.index >= visibleDestCards.length) {
        // Dropping at the very bottom of a list
        newPosition = visibleDestCards[visibleDestCards.length - 1].position + 1024;
      } else {
        // Dropping between two existing cards in the list
        const prevPos = visibleDestCards[destination.index - 1].position;
        const nextPos = visibleDestCards[destination.index].position;
        newPosition = (prevPos + nextPos) / 2;
      }

      // Update the moved card's properties locally
      movedCard.listId = destListId;
      movedCard.position = newPosition;

      // Insert it back into the master array
      newCards.push(movedCard);

      // Optimistically update UI
      set({ cards: newCards });

      // Fire and forget database update
      try {
        await axios.put(`http://localhost:3000/api/cards/${draggableId}/move`, {
          position: newPosition,
          listId: destListId 
        });
      } catch (error) {
        console.error('Failed to save card movement to database:', error);
      }
      return;
    }
  },

  // Action to create a new list and add it to state
  addList: async (title, boardId) => {
    try {
      // Calculate position: place after the last list
      const { lists } = get();
      const position = lists.length > 0
        ? lists[lists.length - 1].position + 1024
        : 1024;

      const response = await axios.post('http://localhost:3000/api/lists', {
        title,
        boardId,
        position,
      });

      const newList = response.data;

      // Push the new list into state
      set({ lists: [...get().lists, newList] });

      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  },

  // Action to create a new card and add it to state
  addCard: async (title, listId) => {
    try {
      // Calculate position: place after the last card in the target list
      const { cards } = get();
      const listCards = cards
        .filter((c) => c.listId === listId && !c.isArchived)
        .sort((a, b) => a.position - b.position);

      const position = listCards.length > 0
        ? listCards[listCards.length - 1].position + 1024
        : 1024;

      const response = await axios.post('http://localhost:3000/api/cards', {
        title,
        listId,
        position,
      });

      const newCard = response.data;

      // Push the new card into the flat cards array
      set({ cards: [...get().cards, newCard] });

      return newCard;
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  },
}));

export default useBoardStore;
