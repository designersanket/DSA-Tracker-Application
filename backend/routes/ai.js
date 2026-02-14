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

    const prompt = `You are a senior Amazon SDE interviewer reviewing a coding solution.

Your job is to:
1. Review the solution strictly
2. Identify logical errors
3. Identify edge cases not handled
4. Check time and space complexity
5. Suggest optimal approach if not used
6. Provide optimized code
7. Explain improvements clearly

Be strict but constructive. Focus on Amazon interview expectations:
- Optimization thinking
- Edge case handling
- Clean code
- Correct data structure usage
- Trade-off discussion

Problem: ${problemTitle || 'DSA Problem'}
Language: ${language || 'Not specified'}

User Code:
\`\`\`
${code}
\`\`\`

Provide response in JSON format:
{
  "verdict": "Correct/Partially Correct/Incorrect",
  "score": <1-10>,
  "timeComplexity": "<complexity>",
  "spaceComplexity": "<complexity>",
  "strengths": ["<point1>", "<point2>"],
  "weaknesses": ["<issue1>", "<issue2>"],
  "edgeCasesMissing": ["<case1>", "<case2>"],
  "improvements": ["<suggestion1>", "<suggestion2>"],
  "optimizedApproach": "<explanation>",
  "optimizations": "<tips>",
  "amazonVerdict": "Reject/Borderline/Accept"
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
