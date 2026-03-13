# Trello Clone

A full-stack project management application inspired by Trello, allowing users to create boards, lists, cards, and manage tasks efficiently.

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Drag and Drop**: `@hello-pangea/dnd`
- **Icons**: Lucide React
- **API Client**: Axios

### Backend
- **Framework**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Prisma Client
- **File Uploads**: Multer
- **Middlewares**: CORS, Express JSON parser

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by creating a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/trello"
   PORT=3000
   ```
4. Set up the database using Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. (Optional) Run the seed script to populate initial data:
   ```bash
   npx prisma db seed
   ```
   *(Note: The seed script clears the database before seeding.)*
6. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Assumptions Made

1. **Authentication**: Authentication is simplified for the current stage. A dummy middleware (`backend/src/middleware/auth.js`) automatically fetches the first user or creates a dummy user ("Yash Gahlot") if none exists. There is no explicit login or signup flow implemented, so all requests act on behalf of this dummy user.
2. **File Storage**: Uploaded attachments are stored directly in the local file system within the `uploads/` directory on the server.
3. **Database Setup**: The PostgreSQL instance is assumed to be running on either a local machine or a cloud provider as configured by the `DATABASE_URL`.

---

## API Endpoints

### Boards Structure (`/api/boards`)
- `GET /api/boards` - Get all boards for the authenticated user
- `GET /api/boards/:id` - Get details of a specific board
- `POST /api/boards` - Create a new board
- `DELETE /api/boards/:id` - Delete a board
- `POST /api/boards/:boardId/labels` - Create a label for a board

### Lists Structure (`/api/lists`)
- `POST /api/lists` - Create a new list
- `PUT /api/lists/:id/move` - Update list position (drag & drop)
- `PUT /api/lists/:id/archive` - Archive/unarchive a list
- `DELETE /api/lists/:id` - Delete a list

### Cards Structure (`/api/cards`)
- `GET /api/cards` - Get cards for a list
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id/move` - Update card position/list (drag & drop)
- `PUT /api/cards/:id/archive` - Archive/unarchive a card
- `PUT /api/cards/:id` - Update card details
- `DELETE /api/cards/:id` - Delete a card

### Card Attachments (`/api/cards`)
- `POST /api/cards/:cardId/attachments` - Upload a file attachment
- `POST /api/cards/:cardId/attachments/link` - Add a link attachment
- `DELETE /api/cards/:cardId/attachments/:attachmentId` - Delete an attachment

### Card Features (`/api`)

#### Labels
- `POST /api/cards/:cardId/labels/:labelId` - Add a label to a card
- `DELETE /api/cards/:cardId/labels/:labelId` - Remove a label from a card
- `POST /api/cards/:cardId/labels/:labelId/toggle` - Toggle a label on a card

#### Members
- `POST /api/cards/:cardId/members/:userId` - Add a member to a card
- `DELETE /api/cards/:cardId/members/:userId` - Remove a member from a card

#### Checklists
- `POST /api/cards/:cardId/checklists` - Create a checklist on a card
- `DELETE /api/cards/:cardId/checklists/:checklistId` - Delete a checklist
- `POST /api/checklists/:checklistId/items` - Add an item to a checklist
- `PATCH /api/checklists/:checklistId/items/:itemId` - Toggle/update a checklist item
- `DELETE /api/checklists/:checklistId/items/:itemId` - Delete a checklist item
## Vercel Deployment Instructions

1. Import this project to Vercel via the Vercel Dashboard (ensure Root Directory is the repository root).
2. Set the 'Framework Preset' to **Vite**.
3. Expand 'Environment Variables' and add:
   - `DATABASE_URL`: Your production PostgreSQL connection pool URL.
4. Click **Deploy**. Vercel will automatically build the frontend into `frontend/dist` and use `backend/api/index.js` as the backend entry for Serverless Functions.
