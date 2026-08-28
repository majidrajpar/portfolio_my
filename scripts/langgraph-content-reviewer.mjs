import Database from 'better-sqlite3';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'portfolio.db');
const db = new Database(dbPath);

// 1. Define State
const GraphState = Annotation.Root({
  contentId: Annotation(),
  columnName: Annotation(),
  draftText: Annotation(),
  feedback: Annotation({
    reducer: (curr, next) => curr.concat(next),
    default: () => [],
  }),
  isApproved: Annotation(),
});

// 2. Configure DeepSeek LLM
const llm = new ChatOpenAI({
  modelName: 'deepseek-chat', 
  temperature: 0.2,
  apiKey: process.env.DEEPSEEK_API_KEY || '', // Set DEEPSEEK_API_KEY environment variable
  configuration: {
    baseURL: 'https://api.deepseek.com',
  },
});

// 3. Writer Node
async function writerNode(state) {
  console.log('\n[Writer Agent] Drafting/Adjusting Content...');
  
  let prompt = `You are a Tier-1 Management Consulting Copywriter (e.g., McKinsey, Bain) specializing in Internal Audit and GRC.
Your task is to aggressively refine the following content for a C-suite audience. 
Rules:
1. Maximize impact, brevity, and authority.
2. Emphasize quantifiable ROI, risk reduction, and governance outcomes.
3. Use active voice and strong action verbs.
4. Output EXACTLY the revised text and nothing else. NO conversational filler, NO prefixes like "Refined Version:".

Original Text:
${state.draftText}`;

  if (state.feedback && state.feedback.length > 0) {
    prompt += `\n\nPlease revise the text incorporating this feedback from the Executive Reviewer:\n- ${state.feedback.join('\n- ')}`;
  }

  const response = await llm.invoke([new HumanMessage(prompt)]);
  return { draftText: response.content };
}

// 4. Reviewer Node
async function reviewerNode(state) {
  console.log('\n[Reviewer Agent] Evaluating Content...');
  
  const prompt = `You are a strict Director of Internal Audit reviewing copy for your consulting website.
The content MUST be professional, objective, free of fluff, and emphasize ROI, risk reduction, and governance.

Review the following draft:
"${state.draftText}"

Respond EXACTLY in this format:
APPROVED: [YES/NO]
FEEDBACK: [If NO, provide 1-2 sentences of specific feedback on what to fix. If YES, write "None".]`;

  const response = await llm.invoke([new SystemMessage(prompt)]);
  const content = response.content;

  const isApproved = content.includes('APPROVED: YES');
  const feedbackMatch = content.match(/FEEDBACK:\s*(.*)/);
  const feedbackText = feedbackMatch ? feedbackMatch[1].trim() : 'No specific feedback provided.';

  if (isApproved) {
    console.log('[Reviewer Agent] ✅ Content APPROVED.');
    return { isApproved: true, feedback: [] };
  } else {
    console.log(`[Reviewer Agent] ❌ Content REJECTED. Feedback: ${feedbackText}`);
    return { isApproved: false, feedback: [feedbackText] };
  }
}

// 5. Save Node
async function saveNode(state) {
  console.log(`\n[Database] Updating Case Study ID ${state.contentId}...`);
  
  // Dynamically set the column to update (e.g., 'action', 'result', 'situation')
  const validColumns = ['situation', 'task', 'action', 'result', 'reflection', 'impact'];
  if (!validColumns.includes(state.columnName)) {
    console.error(`Invalid column name: ${state.columnName}`);
    return state;
  }

  const stmt = db.prepare(`UPDATE case_studies SET ${state.columnName} = ? WHERE id = ?`);
  stmt.run(state.draftText, state.contentId);
  
  console.log(`[Database] ✅ Successfully updated '${state.columnName}' for case study ${state.contentId}.`);
  return state;
}

// 6. Router
function checkApproval(state) {
  if (state.isApproved) {
    return 'saveNode';
  }
  return 'writerNode';
}

// 7. Build Graph
const workflow = new StateGraph(GraphState)
  .addNode('writerNode', writerNode)
  .addNode('reviewerNode', reviewerNode)
  .addNode('saveNode', saveNode)
  .addEdge(START, 'writerNode')
  .addEdge('writerNode', 'reviewerNode')
  .addConditionalEdges('reviewerNode', checkApproval)
  .addEdge('saveNode', END);

const app = workflow.compile();

// --- EXECUTION LOGIC ---
async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: node scripts/langgraph-content-reviewer.mjs <case_study_id> <column_name>");
    console.log("   OR: node scripts/langgraph-content-reviewer.mjs batch");
    process.exit(1);
  }

  if (args[0] === 'batch') {
    console.log("Starting BATCH Review of all case studies and professional engagements...\n");
    
    // Review Case Studies
    const caseStudies = db.prepare(`SELECT id, situation, task, action, result, reflection FROM case_studies`).all();
    const csColumns = ['situation', 'task', 'action', 'result', 'reflection'];
    
    for (const row of caseStudies) {
      for (const col of csColumns) {
        if (!row[col]) continue;
        console.log(`\n==================================================`);
        console.log(`Processing Case Study ID ${row.id} - Column: '${col}'`);
        const finalState = await app.invoke({
          contentId: row.id,
          columnName: col,
          draftText: row[col],
          feedback: [],
          isApproved: false
        });
      }
    }

    // Since we hardcoded the saveNode for case_studies, we should just focus on case_studies for now 
    // to avoid schema mismatch in the saveNode. If we want engagements, we'd need to adjust saveNode.
    console.log("\n✅ Batch review complete for case_studies!");
    return;
  }

  // Single run
  const caseStudyId = parseInt(args[0]);
  const columnName = args[1];

  console.log(`Starting LangGraph Review for Case Study ${caseStudyId}, Column: '${columnName}'`);

  const stmt = db.prepare(`SELECT ${columnName} FROM case_studies WHERE id = ?`);
  const row = stmt.get(caseStudyId);

  if (!row) {
    console.error(`Case study with ID ${caseStudyId} not found.`);
    process.exit(1);
  }

  const finalState = await app.invoke({
    contentId: caseStudyId,
    columnName: columnName,
    draftText: row[columnName],
    feedback: [],
    isApproved: false
  });

  console.log('\n--- FINAL APPROVED TEXT ---');
  console.log(finalState.draftText);
}

run().catch(console.error);
