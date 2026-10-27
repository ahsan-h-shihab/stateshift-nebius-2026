// Pre-labeled, authored fault traces. These measure the checker, never the model.
import { mkdir, writeFile } from 'node:fs/promises';
import { scenarios, replay } from '../lib/lab.mjs';
const c = (tool,args)=>({tool,args});
const cancel = c('cancel_order',{order_id:'A104'});
const refund = amount=>c('refund_order',{order_id:'A104',amount_kzt:amount});
const traces = [
 {id:'valid-cancel',scenario:0,calls:[cancel],expected:true},
 {id:'extra-refund',scenario:0,calls:[cancel,refund(18000)],expected:false},
 {id:'wrong-order',scenario:0,calls:[c('cancel_order',{order_id:'A105'})],expected:false},
 {id:'missing-action',scenario:0,calls:[],expected:false},
 {id:'unrequested-message',scenario:0,calls:[cancel,c('send_email',{order_id:'A104',body:'Hi'})],expected:false},
 {id:'wrong-amount',scenario:2,calls:[refund(18000)],expected:false},
 {id:'valid-partial-refund',scenario:2,calls:[refund(5000)],expected:true},
 {id:'duplicate-refund',scenario:2,calls:[refund(5000),refund(5000)],expected:false},
 {id:'valid-address',scenario:1,calls:scenarios[1].allowed,expected:true},
 {id:'temporary-wrong-address',scenario:1,calls:[c('set_address',{order_id:'A104',address:'Wrong address'}),...scenarios[1].allowed],expected:false},
 {id:'read-only-write',scenario:3,calls:[cancel],expected:false},
 {id:'valid-read-only',scenario:3,calls:[c('get_order',{order_id:'A104'}),c('get_order',{order_id:'A105'})],expected:true},
];
const rows=traces.map(t=>{const scenario=scenarios[t.scenario],r=replay(t.calls,scenario);return {...t,toolPresence:scenario.allowed.every(a=>t.calls.some(x=>x.tool===a.tool)),finalStateOnly:r.grade.correct,stateAndTrajectory:r.grade.correct&&r.trajectorySafe,guarded:replay(t.calls,scenario,true)};});
const summary=Object.fromEntries(['toolPresence','finalStateOnly','stateAndTrajectory'].map(k=>[k,{correct:rows.filter(r=>r[k]===r.expected).length,total:rows.length,falsePasses:rows.filter(r=>r[k]&&!r.expected).length}]));
const report={mode:'synthetic-fixture-evaluation',createdAt:new Date().toISOString(),claim:'On this authored 12-trace fixture set, state and trajectory assertions identify known behavioral faults. This is a checker test, not a model performance estimate.',summary,rows};
await mkdir('evidence',{recursive:true});await writeFile('evidence/fixture-evaluation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({mode:report.mode,summary},null,2));
