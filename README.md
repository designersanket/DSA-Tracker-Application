project:
  name: DSA Progress Tracker
  tagline: >
    A full-stack MERN application that transforms random DSA practice
    into structured, data-driven interview preparation.
  live_demo: https://dsa-sanket.vercel.app
  tech_stack: 
    - React (Vite)
    - Tailwind CSS
    - Node.js
    - Express.js
    - MongoDB
    - JWT Authentication

problem_statement:
  description: >
    Students preparing for placements solve problems across multiple
    platforms like LeetCode, GFG, CodeStudio, etc., but their progress
    becomes fragmented. They lack unified tracking, weakness analysis,
    structured revision, and realistic interview simulation.

  solution: >
    This project centralizes DSA tracking and introduces performance
    intelligence to help students prepare strategically instead of
    practicing randomly.

features:
  dashboard:
    - Total problems solved
    - Current streak
    - Weakest topic detection
    - Interview readiness score
    - GitHub-style heatmap

  question_bank:
    - Add / Edit / Delete problems
    - Store time taken
    - Store wrong attempts
    - Save notes and mistakes
    - Store code snippets
    - Filter by topic, difficulty, platform
    - Track revision status

  interview_mode:
    description: Generates structured mock interview sets
    structure:
      - 3 Easy
      - 2 Medium
      - 1 Hard

  analytics:
    - Weakness detection engine
    - Topic struggle percentage
    - Difficulty distribution charts
    - Cognitive competency radar

  authentication:
    - JWT-based authentication
    - Secure password hashing with bcrypt
    - Protected routes

core_logic:
  weakness_detection:
    based_on:
      - wrong_attempts
      - time_taken
      - topic_frequency
      - revision_level
    output_example: >
      You are weak in Dynamic Programming and Strings.

  interview_generator:
    logic:
      - Filter by difficulty
      - Prioritize weak topics
      - Randomized selection
      - Balanced distribution

architecture:
  frontend:
    - React (Vite)
    - Tailwind CSS
    - Chart.js
    - Framer Motion
    - Monaco Editor

  backend:
    - Node.js
    - Express.js
    - MongoDB (Mongoose)
    - JWT
    - Bcrypt

  pattern:
    - MVC Architecture
    - Service Layer Pattern
    - Modular Routing
    - Indexed MongoDB collections

database:
  user_schema:
    fields:
      name: String
      email: String
      password: Hashed String
      streak: Number
      createdAt: Date
      updatedAt: Date

  question_schema:
    fields:
      userId: ObjectId
      title: String
      platform: String
      difficulty: String
      topics: Array
      dateSolved: Date
      timeTaken: Number
      wrongAttempts: Number
      revisionLevel: String
      notes: String
      mistakes: String
      code: String
      createdAt: Date
      updatedAt: Date

    indexed_on:
      - userId
      - difficulty
      - topics

installation:
  clone:
    command: |
      git clone https://github.com/designersanket/DSA-Tracker-Application.git
      cd DSA-Tracker-Application

  backend_setup:
    steps:
      - cd server
      - npm install
      - create .env file with:
          PORT: 5000
          MONGO_URI: YOUR_MONGODB_URI
          JWT_SECRET: YOUR_SECRET_KEY
      - npm run dev

  frontend_setup:
    steps:
      - cd client
      - npm install
      - npm run dev

deployment:
  frontend: Vercel
  backend: Render / Railway
  database: MongoDB Atlas

learning_outcomes:
  - Full-stack MERN development
  - Secure authentication implementation
  - MongoDB schema design & indexing
  - Aggregation-based analytics
  - Performance-driven tracking system
  - Clean UI/UX design
  - Scalable backend architecture

future_improvements:
  - LeetCode auto-sync
  - Spaced repetition algorithm
  - AI-based topic recommendation
  - Leaderboard system
  - Weekly progress reports

author:
  name: Sanket Jagadale
  role: Full Stack Developer | DSA Enthusiast
