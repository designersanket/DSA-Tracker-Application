
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  leetcodeUsername: { type: String, default: '' },
  githubUsername: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
