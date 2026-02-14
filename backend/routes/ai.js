const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/code-review', async (req, res) => {
  try {
    const { code, language, problemTitle } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Review this DSA solution concisely.

Problem: ${problemTitle || 'DSA Problem'}
Language: ${language || 'Not specified'}

Code:
\`\`\`
${code}
\`\`\`

Provide brief, actionable feedback in JSON:
{
  "score": <1-10>,
  "verdict": "Correct/Needs Work/Incorrect",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "strengths": ["<2-3 brief points>"],
  "improvements": ["<2-3 specific fixes>"],
  "edgeCases": ["<1-2 missing cases or 'None'>"],
  "optimizations": "<1 sentence or 'Optimal'>"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    let review;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      review = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        score: 7,
        timeComplexity: "Analysis in progress",
        spaceComplexity: "Analysis in progress",
        strengths: [text.substring(0, 100)],
        improvements: ["Review the full analysis"],
        optimizations: "See detailed feedback"
      };
    } catch (e) {
      review = {
        score: 7,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        strengths: ["Code submitted successfully"],
        improvements: ["Consider edge cases", "Add comments"],
        optimizations: text.substring(0, 200)
      };
    }

    res.json(review);
  } catch (error) {
    console.error('AI Review Error:', error);
    res.status(500).json({ message: 'AI review failed', error: error.message });
  }
});

module.exports = router;
