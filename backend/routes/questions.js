
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Get all questions for user
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user.id }).sort({ dateSolved: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create question
router.post('/', async (req, res) => {
  const question = new Question({ ...req.body, userId: req.user.id });
  try {
    const newQuestion = await question.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update question
router.put('/:id', async (req, res) => {
  try {
    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  try {
    await Question.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Analytics: Weakness Detection
router.get('/analysis/weakness', async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user.id });
    const topicStats = {};
    
    questions.forEach(q => {
      q.topics.forEach(t => {
        if (!topicStats[t]) topicStats[t] = { count: 0, status: [] };
        topicStats[t].count++;
        topicStats[t].status.push(q.revisionLevel);
      });
    });

    const weaknesses = Object.entries(topicStats)
      .map(([topic, stat]) => {
        const struggling = stat.status.filter(s => s === 'Struggled' || s === 'Needs Revision').length;
        const score = (struggling / stat.count) * 100;
        return { topic, score, count: stat.count };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    res.json(weaknesses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Interview Set Generation
router.get('/simulation/generate', async (req, res) => {
  try {
    const pool = await Question.find({ userId: req.user.id });
    const getRand = (arr, count) => arr.sort(() => 0.5 - Math.random()).slice(0, count);
    
    const easy = getRand(pool.filter(q => q.difficulty === 'Easy'), 3);
    const medium = getRand(pool.filter(q => q.difficulty === 'Medium'), 2);
    const hard = getRand(pool.filter(q => q.difficulty === 'Hard'), 1);
    
    res.json([...easy, ...medium, ...hard]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
