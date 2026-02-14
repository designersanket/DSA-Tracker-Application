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

    const prompt = `You are an expert code reviewer for DSA problems. Review the following code and provide:
1. Code Quality (1-10)
2. Time Complexity
3. Space Complexity
4. Strengths (2-3 points)
5. Improvements (2-3 specific suggestions)
6. Optimizations (if any)

Problem: ${problemTitle || 'DSA Problem'}
Language: ${language || 'Not specified'}

Code:
\`\`\`
${code}
\`\`\`

Provide a concise, structured review in JSON format:
{
  "score": <number>,
  "timeComplexity": "<complexity>",
  "spaceComplexity": "<complexity>",
  "strengths": ["<point1>", "<point2>"],
  "improvements": ["<suggestion1>", "<suggestion2>"],
  "optimizations": "<optimization tips or 'None'"
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
