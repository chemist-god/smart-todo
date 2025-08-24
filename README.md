# Smart Todo - Your Personal Productivity Ecosystem

A comprehensive task management and note-taking application with gamification features, built with Next.js, NextAuth.js, and Prisma.

## Features

### 🎯 Core Features
- **Todo Management**: Create, edit, delete, and track todos with priorities and due dates
- **Note Taking**: Capture thoughts with different note types (General, Bible Study, Conference, Song, Quote, Reflection)
- **Gamification**: Earn points, level up, and unlock achievements
- **Dashboard**: Real-time overview of your productivity stats
- **Responsive Design**: Beautiful, modern UI that works on all devices

### 🏆 Gamification System
- **Points System**: Earn points for completing tasks and creating notes
- **Level Progression**: Level up based on total points earned
- **Achievements**: Unlock achievements for various milestones
- **Streaks**: Track your daily activity streaks

### 📊 Analytics & Insights
- **Real-time Stats**: View your productivity metrics
- **Progress Tracking**: Monitor your level progress and achievements
- **Activity Overview**: See your completion rates and patterns

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Heroicons
- **Date Handling**: date-fns

## Project Structure

```
smart-todo/
├── src/
│   ├── app/
│   │   ├── (authenticated)/     # Protected routes with sidebar
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── todos/          # Todo management
│   │   │   ├── notes/          # Note taking
│   │   │   ├── calendar/       # Calendar view (coming soon)
│   │   │   ├── analytics/      # Analytics dashboard (coming soon)
│   │   │   ├── achievements/   # Achievement tracking
│   │   │   └── layout.tsx      # Authenticated layout with sidebar
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── todos/          # Todo CRUD operations
│   │   │   ├── notes/          # Note CRUD operations
│   │   │   ├── achievements/   # Achievement data
│   │   │   └── stats/          # User statistics
│   │   ├── page.tsx            # Landing page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components (Sidebar, AppLayout)
│   │   ├── todos/              # Todo-related components
│   │   ├── notes/              # Note-related components
│   │   ├── achievements/       # Achievement components
│   │   └── providers/          # Context providers
│   ├── lib/
│   │   └── auth.ts             # NextAuth configuration
│   └── types/
│       └── next-auth.d.ts      # TypeScript declarations
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-todo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/smart_todo"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main models:

- **User**: Authentication and user profile data
- **Todo**: Task management with priorities and due dates
- **Note**: Note-taking with different types
- **Achievement**: Gamification achievements
- **UserAchievement**: User progress tracking
- **UserStats**: User statistics and progress

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Todos
- `GET /api/todos` - List todos with filtering and sorting
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo

### Notes
- `GET /api/notes` - List notes with filtering and search
- `POST /api/notes` - Create a new note
- `PUT /api/notes/[id]` - Update a note
- `DELETE /api/notes/[id]` - Delete a note

### Statistics
- `GET /api/stats` - Get user statistics and progress

### Achievements
- `GET /api/achievements` - Get available achievements and user progress

## Features in Development

- **Calendar View**: Full calendar integration with todo scheduling
- **Advanced Analytics**: Detailed productivity insights and charts
- **AI Insights**: AI-powered productivity recommendations
- **Mobile App**: Native mobile application
- **Team Collaboration**: Shared workspaces and team features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
