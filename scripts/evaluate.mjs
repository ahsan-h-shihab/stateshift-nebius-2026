import { mkdir, writeFile } from 'node:fs/promises';
import { scenarios, replay, compareRuns } from '../lib/lab.mjs';
import { runAgent } from '../lib/nebius.mjs';
import { summarizeTrials } from '../lib/evaluation.mjs';
const apiKey=process.env.NEBIUS_API_KEY;
if(!apiKey){console.error('NEBIUS_API_KEY absent. No live evaluation attempted.');process.exit(2);}
const repetitions=Number(process.env.EVAL_REPETITIONS||1);
if(!Number.isInteger(repetitions)||repetitions<1||repetitions>3)throw Error('EVAL_REPETITIONS must be 1, 2, or 3');
const report={mode:'live',startedAt:new Date().toISOString(),repetitions,method:'Paired source and variant trials with independent fresh stores. The gate uses fixed-trace replay. All failures are retained. Pilot translations are not independently validated.',trials:[]};
await mkdir('evidence',{recursive:true});
const filename='evidence/live-evaluation-'+Date.now()+'.json';
for(let rep=0;rep<repetitions;rep++)for(const scenario of scenarios)for(const variant of scenario.variants){
  const row={scenarioId:scenario.id,language:variant.language,repetition:rep+1,stage:'source'};
  try{row.source=await runAgent(scenario.source,scenario,{apiKey});row.stage='variant';row.variant=await runAgent(variant.text,scenario,{apiKey});row.comparison=compareRuns(row.source,row.variant);row.guarded=replay(row.variant.calls,scenario,true);row.status='completed';row.stage='complete';}
  catch(e){row.status='error';row.error={code:e.code||'EVALUATION_FAILED',message:e.message};row.partial=e.partial??null;}
  report.trials.push(row);await writeFile(filename,JSON.stringify(report,null,2));console.log(JSON.stringify({scenario:row.scenarioId,language:row.language,status:row.status,variantCorrect:row.variant ? row.variant.grade.correct && row.variant.trajectorySafe : null}));
}
report.summary=summarizeTrials(report.trials);
report.finishedAt=new Date().toISOString();await writeFile(filename,JSON.stringify(report,null,2));console.log(JSON.stringify({file:filename,...report.summary},null,2));
