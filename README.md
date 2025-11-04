# Ministry Time Planner & Tracker App

## Overview
The Ministry Time Planner & Tracker App is a calendar-based application designed to help Jehovah's Witnesses plan and track their field service ministry activity. It focuses on planning time, setting targets versus logging actuals for each day, month, and year, and provides real-time feedback on progress towards monthly goals through a "Red, Amber, Green" (RAG) status indicator.

## Features

### Daily Planning & Tracking
- **Target Time Setting:** Easily set target hours for field service on specific days.
- **Actual Time Logging:** Log actual hours spent in field service for each day.
- **Calendar Interface:** A visual calendar displays both planned (target) and logged (actual) activities.

### Progress Summaries
- **Weekly, Monthly, and Yearly Summaries:** Automatic calculation and display of total target hours versus actual hours logged for various periods, highlighting discrepancies.

### Goal Tracking & RAG Status
- **Goal Setting:** Set overall monthly and yearly hour targets.
- **Real-time Progress Monitoring:** Continuous tracking of progress against monthly goals, considering past actuals and future planned activities.
- **RAG Status Indicator:** A prominent visual indicator (Red, Amber, Green) provides immediate feedback on the likelihood of meeting the monthly target.

## Technology Stack
- **Frontend Framework:** Next.js (with React)
- **Backend, Database & Authentication:** Supabase (PostgreSQL, authentication, real-time)
- **Styling:** Tailwind CSS
- **Date & Time Utilities:** `date-fns`
- **Calendar Component:** `React Big Calendar`
- **Charting/Data Visualization:** `Recharts`
- **Deployment:** Vercel

## Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sladerose/TimePlanner.git
   cd TimePlanner/time-planner
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Variables
Create a `.env.local` file in the `time-planner` directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### Database Setup (Supabase)
The Supabase schema is provided in `supabase_schema.sql`. You can use this to set up your Supabase project.

### Running the Development Server
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment
This application is designed for deployment on [Vercel](https://vercel.com).

## Testing
- **Unit Tests:** Jest
- **Integration Tests:** Jest, React Testing Library

## Future Enhancements
- Integration with other ministry-related tools.
- Ability to track different categories of ministry activity.
- Support for multiple users.
- Data export functionality.