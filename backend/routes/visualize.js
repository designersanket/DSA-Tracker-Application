const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const buildPrompt = (code, language, title) => `
You are an expert DSA execution trace generator. Analyze this ${language} code and generate a precise step-by-step execution trace.

Problem: ${title || 'DSA Problem'}
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

STRICT RULES:
1. Generate between 8 and 40 steps. Compress repetitive loop iterations.
2. Detect the primary DSA pattern: array, linkedList, stack, queue, tree, graph, dp, sorting, searching, recursion.
3. Each step must represent ONE meaningful operation: assignment, comparison, swap, push, pop, enqueue, dequeue, return, branch, recursive_call.
4. For array/sorting: track the full array state after every change.
5. For stack/queue: track the full structure state after every push/pop/enqueue/dequeue.
6. For tree/graph: track visited nodes and current node.
7. For DP: track the dp table state.
8. activeIndices must list indices being compared, swapped, or accessed.
9. Write a short description (1 sentence) per step suitable for a beginner.
10. Output ONLY valid JSON. Zero markdown. Zero text outside the JSON object.

OUTPUT FORMAT (return exactly this structure):
{
  "algorithmType": "bubble_sort|selection_sort|insertion_sort|merge_sort|quick_sort|linear_search|binary_search|stack|queue|linked_list|tree_traversal|bfs|dfs|dynamic_programming|recursion|array",
  "totalSteps": <number>,
  "complexityAnalysis": {
    "time": "O(...)",
    "space": "O(...)",
    "explanation": "<1 sentence>"
  },
  "steps": [
    {
      "step": 1,
      "line": <line_number_in_code>,
      "action": "assign|compare|swap|push|pop|enqueue|dequeue|return|branch|call|access|update",
      "variables": {
        "<varName>": { "value": <value>, "changed": <boolean> }
      },
      "dataStructure": {
        "type": "array|stack|queue|tree|graph|dp_table|none",
        "data": <current_state_array_or_object>,
        "highlights": [<indices_or_node_ids_that_are_active>],
        "comparing": [<indices_being_compared>],
        "swapping": [<indices_being_swapped>],
        "sorted": [<indices_confirmed_sorted>]
      },
      "callStack": [
        { "fn": "<function_name>", "args": "<args_string>" }
      ],
      "output": "<any_console_output_at_this_step_or_empty_string>",
      "description": "<beginner_friendly_1_sentence_explanation>"
    }
  ]
}
`;

router.post('/generate', async (req, res) => {
  try {
    const { code, language, title } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Code is required' });
    }
    if (code.split('\n').length > 120) {
      return res.status(400).json({ message: 'Code exceeds 120 lines. Please reduce for visualization.' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = buildPrompt(code.trim(), language || 'cpp', title || 'DSA Problem');
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let trace;
    try {
      trace = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid JSON from Gemini');
      trace = JSON.parse(jsonMatch[0]);
    }

    // Normalize: ensure every step has required fields
    trace.steps = (trace.steps || []).map((step, i) => ({
      step: step.step ?? i + 1,
      line: step.line ?? 0,
      action: step.action ?? 'update',
      variables: step.variables ?? {},
      dataStructure: step.dataStructure ?? { type: 'none', data: [], highlights: [], comparing: [], swapping: [], sorted: [] },
      callStack: step.callStack ?? [],
      output: step.output ?? '',
      description: step.description ?? ''
    }));

    res.json(trace);
  } catch (error) {
    console.error('Visualization Error:', error);
    res.status(500).json({ message: 'Trace generation failed', error: error.message });
  }
});

module.exports = router;
