# CodeSight

CodeSight is a web app platform for developers to share, review, and discuss code snippets. Built with React, Vite, and Supabase, it delivers secure user authentication, code submissions, reviews, likes, nested replies, and a responsive UI. Deployed at [codesight.vercel.app](https://codesight.vercel.app).

## Features

- **User Authentication**: Secure login/signup via Supabase Auth.
- **Code Submissions**: Create, edit, delete snippets with title, language, and code.
- **Reviews & Replies**: Post, edit, delete reviews with threaded, nested replies.
- **Like/Dislike**: Upvote/downvote reviews to highlight valuable feedback.
- **Search**: Find submissions by title instantly.
- **Profile Management**: Update email, manage submissions.
- **Mobile-Responsive**: Optimized for phones using Tailwind CSS.
- **Secure Backend**: Supabase with Row-Level Security and cascading deletes.

## Tech Stack

- **Frontend**: React 18, Vite 4, Tailwind CSS 3, React Router 6
- **Backend**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel
- **Tools**: TypeScript, Lucide Icons, date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account

### Installation

1. Clone:
   ```bash
   git clone https://github.com/abeniben/CodeSight.git
   cd CodeSight
2. Install:
   ```bash
   npm install
3. Environment Variables:
   create .env
   ```bash
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
4. Run:
   ```bash
   npm run dev

 ###  Supabase Setup
1. Create a Supabase project at supabase.com.
2. Set up tables (submissions, reviews, replies, review_votes) with RLS.
3. Enable Supabase Auth (email-based).
4. Configure RLS for secure access.

## Deployment

Live deployment: [codesight.vercel.app](https://codesight.vercel.app)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request
