
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  platform: { type: String, default: 'LeetCode' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topics: [String],
  dateSolved: { type: Date, default: Date.now },
  timeTaken: Number,
  wrongAttempts: { type: Number, default: 0 },
  revisionLevel: { type: String, default: 'Needs Revision' },
  notes: String,
  mistakes: String,
  code: String
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
