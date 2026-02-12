
[# 🚀 DSA Progress Tracker](https://dsa-sanket.vercel.app/)

A full-stack MERN application that transforms random DSA practice into structured, data-driven interview preparation.

** 🔗 Live Demo: https://dsa-sanket.vercel.app

** 🛠 Tech Stack: React + Node.js + Express + MongoDB (MERN)

** 📌 Why This Project?

Students preparing for placements solve problems across multiple platforms like:

LeetCode

GeeksforGeeks

CodeStudio

Codeforces

However:

Progress becomes scattered

Weak areas are unclear

No structured revision system

No realistic interview simulation

No performance-based analytics

This project centralizes DSA tracking and introduces performance intelligence to help students prepare strategically.

# 🎯 What Makes It Different?

This is not just a problem tracker.

It is a Performance Intelligence Dashboard for DSA preparation.

It focuses on:

Behavioral analytics

Weakness detection

Interview simulation

Revision tracking

Readiness scoring

It answers:
“How are you performing, and where should you improve?”

# ✨ Features
📊 Dashboard

Total problems solved

Current streak

Core bottleneck detection

Interview readiness score

GitHub-style activity heatmap

# 📚 Question Bank

Add / Edit / Delete problems

Store:

Time taken

Wrong attempts

Notes

Mistakes

Code snippets

Filter by topic, difficulty, platform

Track revision status

# 🎯 Interview Mode

Automatically generates:

3 Easy

2 Medium

1 Hard

Balanced assessment sets for realistic technical interview simulation.

# 📈 Advanced Analytics

Topic-based struggle percentage

Weakness detection engine

Cognitive competency radar

Performance-driven readiness score

# 🔐 Authentication

JWT-based authentication

Secure password hashing (bcrypt)

Protected routes

# 🧠 Core Logic
🔍 Weakness Detection Algorithm

Analyzes:

Wrong attempts

Time taken

Topic frequency

Revision level

Outputs example:
"You are weak in Dynamic Programming and Strings."

# 🎯 Interview Mode Generator

Filters by difficulty

Prioritizes weak topics

Randomized selection

Balanced distribution logic

# 🏗️ Tech Stack
Frontend

React (Vite)

Tailwind CSS

Chart.js

Framer Motion

Monaco Editor

Backend

Node.js

Express.js

MongoDB (Mongoose)

JWT Authentication

Bcrypt

📂 Project Structure
dsa-progress-tracker/
│
├── client/        # React Frontend
├── server/        # Express Backend
├── README.md


# Backend Architecture:

MVC Pattern

Service Layer

Modular Routing

Indexed MongoDB collections

# Database Design
User Schema
{
  name: String,
  email: String,
  password: String,
  streak: Number,
  createdAt: Date
}

# Question Schema
{
  userId: ObjectId,
  title: String,
  platform: String,
  difficulty: String,
  topics: [String],
  dateSolved: Date,
  timeTaken: Number,
  wrongAttempts: Number,
  revisionLevel: String,
  notes: String,
  mistakes: String,
  code: String
}


Indexed on:

userId

difficulty

topics

#⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/designersanket/DSA-Tracker-Application.git
      cd DSA-Tracker-Application

2️⃣ Backend Setup
cd server
npm install


Create .env file:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key


# Run backend:

npm run dev

3️⃣ Frontend Setup
cd client
npm install
npm run dev

# 🚀 Deployment

Frontend: Vercel

Backend: Render / Railway

Database: MongoDB Atlas

🎓 Learning Outcomes

This project demonstrates:

Full-stack MERN development

Secure authentication implementation

MongoDB schema design & indexing

Aggregation-based analytics

Algorithmic performance tracking

Clean UI/UX implementation

Scalable backend architecture

# 📌 Future Improvements

LeetCode auto-sync

Spaced repetition algorithm

AI-based topic recommendation

Leaderboard system

Weekly progress reports

# 👨‍💻 Author

Sanket Jagadale
DSA & Full Stack Developer
