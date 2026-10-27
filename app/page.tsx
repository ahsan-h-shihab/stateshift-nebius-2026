'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight, Circle, Code2, Download, FlaskConical, GitCompareArrows, Globe2, Layers3, LoaderCircle, Play, RotateCcw, ShieldCheck, Sparkles, Terminal, X, Zap } from 'lucide-react';
import { scenarios, initialState, evidenceBundle, regressionSource } from '../lib/lab.mjs';
import { fixtureReport } from '../lib/fixture.mjs';

type Report = ReturnType<typeof fixtureReport> & { [key: string]: any };
const download = (filename: string, text: string, type = 'application/json') => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

export default function Home() {
  const [view, setView] = useState('lab');
  const [selected, setSelected] = useState(0);
  const [language, setLanguage] = useState(0);
  const [variant, setVariant] = useState(scenarios[0].variants[0].text);
  const [confirmed, setConfirmed] = useState(false);
  const [health, setHealth] = useState<{configured: boolean} | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [partial, setPartial] = useState<any>(null);
  const [traceTab, setTraceTab] = useState<'source' | 'variant' | 'guarded'>('variant');
  const [step, setStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [history, setHistory] = useState<Report[]>([]);
  const scenario = scenarios[selected];
  const refresh = () => fetch('/api/health').then(r => r.json() as Promise<{configured: boolean}>).then(setHealth).catch(() => setHealth(null));
  useEffect(() => { refresh(); }, []);
  function choose(index: number, lang = language) { setSelected(index); setLanguage(lang); setVariant(scenarios[index].variants[lang].text); setConfirmed(false); setGenerated(false); setError(''); setReport(null); setPartial(null); }
  async function generate() {
    setBusy(true); setStage('Nemotron is generating a candidate variant…'); setError('');
    try { const response = await fetch('/api/mutate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenarioId: scenario.id, language: scenario.variants[language].language }) }); const data = await response.json() as {error?: string; variant: string}; if (!response.ok) throw Error(data.error); setVariant(data.variant); setConfirmed(false); setGenerated(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Variant generation failed.'); }
    finally { setBusy(false); setStage(''); }
  }
  async function run() {
    setBusy(true); setError(''); setReport(null); setPartial(null); setStage('Connecting to Nebius Token Factory…'); setStep(0); setTraceTab('variant');
    try {
      const response = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenarioId: scenario.id, variant, equivalenceConfirmed: confirmed }) });
      if (!response.ok) { const data = await response.json() as {error?: string}; throw Error(data.error); }
      if (!response.body) throw Error('The streaming response was unavailable.');
      const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '', completed = false;
      function receive(line: string) {
        const event = JSON.parse(line);
        if (event.type === 'stage') setStage(event.message);
        if (event.type === 'source') setPartial(event.run);
        if (event.type === 'error') { if (event.partial) setPartial((prior: any) => ({ completedSource: prior, failedRun: event.partial })); throw Error(event.message); }
        if (event.type === 'complete') { completed = true; setReport(event.report); setHistory(previous => [event.report, ...previous].slice(0, 8)); setStep(event.report.variant.firstViolation ?? 0); }
      }
      while (true) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n'); buffer = lines.pop() || ''; lines.filter(Boolean).forEach(receive); }
      buffer += decoder.decode(); if (buffer.trim()) receive(buffer);
      if (!completed) throw Error('The stream ended before both runs completed. No comparison was recorded.');
    } catch (e) { setError(e instanceof Error ? e.message : 'The run failed.'); }
    finally { setBusy(false); setStage(''); refresh(); }
  }
  function loadFixture() { const data = fixtureReport(); setReport(data); setSelected(0); setLanguage(0); setVariant(data.variant.prompt); setConfirmed(false); setStep(2); setTraceTab('variant'); setError(''); setPartial(null); }
  const activeRun = report ? report[traceTab] : null;
  const activeStep = activeRun?.trace[step];

  return <div className="shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="StateShift home"><span className="brand-icon"><Layers3 size={22}/></span>StateShift<span className="brand-dot">.</span></a>
      <div className="workspace-label">AGENT RELIABILITY WORKSPACE</div>
      <nav aria-label="Main navigation">
        <button className={view === 'lab' ? 'nav-item active' : 'nav-item'} onClick={() => setView('lab')}><FlaskConical size={19}/>Experiment lab <span>01</span></button>
        <button className={view === 'evidence' ? 'nav-item active' : 'nav-item'} onClick={() => setView('evidence')}><Code2 size={19}/>Evidence shelf <span>{history.length.toString().padStart(2, '0')}</span></button>
        <button className={view === 'method' ? 'nav-item active' : 'nav-item'} onClick={() => setView('method')}><ShieldCheck size={19}/>Method & limits</button>
      </nav>
      <div className="sidebar-note"><div className="orbit"><Globe2 size={30}/><span>EN</span><span>ҚАЗ</span><span>বাংলা</span></div><h3>Same intent.<br/>Same outcome?</h3><p>Language should change the conversation. It shouldn’t change the transaction.</p></div>
      <div className="runtime-card"><span className={'status-dot ' + (health?.configured ? 'green' : 'amber')}/><strong>{health?.configured ? 'Nebius configured' : 'Live runtime pending'}</strong><p>NVIDIA Nemotron 3.5 Lightning</p><button onClick={refresh}>Refresh connection <RotateCcw size={12}/></button></div>
      <div className="sidebar-footer">OPEN SOURCE · PILOT BUILD <span>v0.1</span></div>
    </aside>

    <main>
      <header className="topbar"><div>Workspace <ChevronRight size={14}/><strong>{view === 'lab' ? 'Experiment lab' : view === 'evidence' ? 'Evidence shelf' : 'Method & limits'}</strong></div><span className="sandbox-label"><span className="status-dot green"/> Isolated order sandbox</span></header>
      <div className="main-content">
        {view === 'lab' && <>
          <section className="page-heading"><div><div className="eyebrow">MULTILINGUAL AGENT REGRESSION LAB</div><h1>Test what your agent <em>changes.</em></h1><p>One intent. Two languages. Inspect every action and the state it leaves behind.</p></div><button className="button subtle" onClick={loadFixture} disabled={busy}><Play size={15}/> Explore synthetic example <ArrowUpRight size={15}/></button></section>
          <div className="workflow-strip"><span><b>01</b> Define the contract</span><ArrowRight size={16}/><span><b>02</b> Replay both requests</span><ArrowRight size={16}/><span><b>03</b> Inspect the difference</span><ArrowRight size={16}/><span><b>04</b> Export the evidence</span></div>

          <div className="lab-grid">
            <section className="card experiment-card"><div className="card-heading"><div><span className="section-num">01</span><h2>Set up an experiment</h2></div><FlaskConical size={18}/></div>
              <label className="field-label" htmlFor="scenario">TEST SCENARIO</label>
              <select id="scenario" value={selected} disabled={busy} onChange={e => choose(Number(e.target.value))}>{scenarios.map((s, i) => <option key={s.id} value={i}>{s.title}</option>)}</select>
              <p className="field-help">{scenario.description}</p>
              <div className="request-box"><div className="mini-heading"><span className="language-pill">EN</span> Reference request <span>English</span></div><p>{scenario.source}</p></div>
              <div className="language-control"><label className="field-label" htmlFor="language">LANGUAGE VARIANT</label><select id="language" value={language} disabled={busy} onChange={e => choose(selected, Number(e.target.value))}>{scenario.variants.map((v, i) => <option key={v.language} value={i}>{v.language}</option>)}</select></div>
              <textarea aria-label="Code-switched request" value={variant} maxLength={1600} disabled={busy} onChange={e => { setVariant(e.target.value); setConfirmed(false); setGenerated(false); }}/>
              <div className="variant-tools"><span>{generated ? 'Model-generated · review required' : 'Editable pilot input · review required'}</span><button onClick={generate} disabled={busy || !health?.configured}><Sparkles size={13}/> Generate candidate</button></div>
              <label className="confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)}/><span>I confirm the variant preserves every instruction, prohibition, entity, and amount above.</span></label>
              <button className="button primary run-button" disabled={busy || !confirmed || !health?.configured} onClick={run}>{busy ? <LoaderCircle className="spin" size={18}/> : <Play size={16}/>} {busy ? 'Experiment running…' : 'Run live comparison'}<ArrowRight size={17}/></button>
              <p className="runtime-hint">{health?.configured ? 'Real Nebius calls · fresh state per request · bounded tool loop' : 'Live runs unlock when the server’s Nebius key is configured.'}</p>
            </section>

            <section className="card contract-card"><div className="card-heading"><div><span className="section-num">02</span><h2>The outcome contract</h2></div><ShieldCheck size={18}/></div><p className="card-intro">Defined before inference. Checked by code.</p>
              <div className="contract-status"><span className="icon-circle"><Check size={19}/></span><div><strong>Only these changes are authorized</strong><small>{Object.keys(scenario.expected).length ? 'Everything else must remain identical.' : 'This is a read-only request. No writes allowed.'}</small></div></div>
              <div className="contract-values">{Object.entries(scenario.expected).map(([key, value]) => <div key={key}><code>{key}</code><span><ArrowRight size={13}/> {String(value)}</span></div>)}{!Object.keys(scenario.expected).length && <code>state_after === state_before</code>}</div>
              <div className="invariant"><CheckCircle2 size={16}/><span>Untargeted order stays unchanged</span></div><div className="invariant"><CheckCircle2 size={16}/><span>No unauthorized refunds or messages</span></div><div className="invariant"><CheckCircle2 size={16}/><span>Required change actually happens</span></div>
              <div className="state-heading"><span>INITIAL STATE</span><span>Reset before each run <RotateCcw size={12}/></span></div>
              <div className="order-table"><div className="table-row table-head"><span>ORDER</span><span>STATUS</span><span>REFUNDED</span></div>{Object.entries(initialState().orders).map(([id, order]) => <div className="table-row" key={id}><strong>{id}</strong><span className="pill pending">{order.status}</span><span>{order.refundedKzt.toLocaleString()} KZT</span></div>)}</div>
              <div className="model-note"><Zap size={17}/><div><strong>Nemotron chooses the actions.</strong><p>The sandbox executes them. StateShift checks the resulting state against this contract.</p></div></div>
              <p className="tiny-note">Synthetic orders. No real money moves and no email is delivered.</p>
            </section>
          </div>

          {busy && <div className="progress" role="status"><LoaderCircle className="spin" size={18}/><strong>{stage}</strong><span>Source → reset → variant → check</span></div>}
          {error && <div className="error-box" role="alert"><X size={19}/><div><strong>Experiment incomplete</strong><p>{error}</p>{partial && <button className="text-button" onClick={() => download('stateshift-partial-run.json', JSON.stringify({ mode: 'partial-live', source: partial, error }, null, 2))}>Download completed source run</button>}</div></div>}
          {report ? <section className="results" aria-label="Experiment results">
            <div className={'result-banner ' + (report.mode === 'fixture' ? 'fixture' : 'live')}><span>{report.mode === 'fixture' ? <FlaskConical size={17}/> : <Zap size={17}/>}<strong>{report.mode === 'fixture' ? 'SYNTHETIC EXAMPLE — NO MODEL CALL' : 'LIVE NEBIUS RUN'}</strong></span><span>{report.mode === 'fixture' ? 'Hand-authored fault injection. Not a measured model result.' : new Date(report.generatedAt).toLocaleTimeString()}</span></div>
            <div className="results-heading"><div><div className="eyebrow">EXPERIMENT RESULT</div><h2>{report.comparison.equivalent ? 'Same state. Check correctness.' : 'Same intent. Different consequences.'}</h2><p>{report.scenario.title} · {report.variant.calls.length} variant tool calls</p></div><button className="button secondary" onClick={() => download('stateshift-evidence.json', JSON.stringify(evidenceBundle(report), null, 2))}><Download size={16}/> Evidence JSON</button></div>
            <div className="metric-grid"><div className="metric"><span>OUTCOME EQUIVALENCE</span><strong className={report.comparison.equivalent ? 'text-green' : 'text-orange'}>{report.comparison.equivalent ? 'Match' : 'Diverged'}</strong><small>{report.comparison.stateDiff.length} state field differences</small></div><div className="metric"><span>REFERENCE CORRECTNESS</span><strong>{(report.source.grade.correct && report.source.trajectorySafe) ? 'Pass' : 'Fail'}</strong><small>Against the explicit contract</small></div><div className="metric"><span>VARIANT CORRECTNESS</span><strong className={(report.variant.grade.correct && report.variant.trajectorySafe) ? 'text-green' : 'text-orange'}>{(report.variant.grade.correct && report.variant.trajectorySafe) ? 'Pass' : 'Fail'}</strong><small>{report.variant.trace.filter((t: any) => t.violations.length).length} steps with unauthorized state</small></div><div className="metric"><span>CONTRACT REPLAY</span><strong className={report.guarded.grade.correct ? 'text-green' : 'text-orange'}>{report.guarded.grade.correct ? 'Pass' : 'Incomplete'}</strong><small>{report.guarded.trace.filter((t: any) => t.result.error === 'CONTRACT_BLOCKED').length} proposals blocked · same trace</small></div></div>
            <div className="card trace-card"><div className="card-heading"><div><span className="section-num">03</span><h2>Follow the state, step by step</h2></div><span className="monospace">{report.mode === 'live' ? 'PROVIDER TRACE' : 'SYNTHETIC TRACE'}</span></div>
              <div className="trace-tabs" role="tablist">{(['source', 'variant', 'guarded'] as const).map(tab => <button role="tab" aria-selected={traceTab === tab} key={tab} className={traceTab === tab ? 'selected' : ''} onClick={() => { setTraceTab(tab); setStep(0); }}>{tab === 'source' ? 'English reference' : tab === 'variant' ? 'Language variant' : 'Contract replay'}<span>{report[tab].trace.length}</span></button>)}</div>
              <div className="trace-grid"><div className="trace-list">{activeRun?.trace.length ? activeRun.trace.map((t: any, i: number) => <button className={'trace-step ' + (step === i ? 'selected' : '')} key={i} onClick={() => setStep(i)}><span className={'step-dot ' + (t.result.error ? 'blocked' : t.violations.length ? 'bad' : 'good')}>{t.result.error ? <ShieldCheck size={14}/> : t.violations.length ? <X size={14}/> : <Check size={14}/>}</span><span><strong>{t.tool}</strong><small>{t.args?.order_id || 'Invalid arguments'} · {t.changes.length} changes</small></span><span className="step-number">{String(i + 1).padStart(2, '0')}</span></button>) : <div className="empty-trace">No tool calls were made. Inspect task correctness above.</div>}</div>
                <div className="state-inspector">{activeStep ? <><div className="inspector-top"><span>STEP {step + 1} / {activeRun.trace.length}</span><span className={'pill ' + (activeStep.result.error ? 'pending' : activeStep.violations.length ? 'danger' : 'success')}>{activeStep.result.error || (activeStep.violations.length ? 'CONTRACT VIOLATION' : 'VALID STATE')}</span></div><h3>{activeStep.tool}<span>({activeStep.args?.order_id})</span></h3><pre className="arguments">{JSON.stringify(activeStep.args, null, 2)}</pre><div className="state-diff-label">STATE CHANGES</div>{activeStep.changes.length ? activeStep.changes.map((d: any) => <div className="diff-row" key={d.path}><code>{d.path}</code><div><span className="removed">− {JSON.stringify(d.before)}</span><ArrowRight size={14}/><span className="added">+ {JSON.stringify(d.after)}</span></div></div>) : <p className="no-changes">No state was changed by this step.</p>}<details><summary>Inspect complete tool result & state</summary><pre>{JSON.stringify({ result: activeStep.result, before: activeStep.before, after: activeStep.after }, null, 2)}</pre></details></> : <p>No step to inspect.</p>}</div>
              </div>
            </div>
            <div className="evidence-bottom"><div><Terminal size={20}/><div><h3>A result you can reproduce.</h3><p>Export the exact calls, contract, and assertion. A failing trace produces a failing test.</p></div></div><button className="button secondary" onClick={() => download('regression.mjs', regressionSource(report), 'text/javascript')}><Code2 size={16}/> Export regression test</button></div>
            <p className="method-note">{report.evaluationNote} {report.mode === 'live' && `Estimated token cost: $${(report.source.estimatedCostUsd + report.variant.estimatedCostUsd).toFixed(6)} using catalog rates; failed/retried requests may add cost.`}</p>
            <details className="provenance"><summary>Request provenance, usage & final state</summary><pre>{JSON.stringify({ mode: report.mode, sourceRequests: report.source.requests, variantRequests: report.variant.requests, stateDiff: report.comparison.stateDiff, firstUnsafePrefix: report.prefix }, null, 2)}</pre></details>
          </section> : !busy && <div className="empty-results"><div className="empty-symbol"><GitCompareArrows size={26}/></div><div><h3>Make the invisible difference visible.</h3><p>Run a live experiment, or open the labeled synthetic example to explore the inspector.</p></div><span className="grid-decoration">EN → STATE ← ҚАЗ</span></div>}
        </>}

        {view === 'evidence' && <section><div className="eyebrow">INSPECTABLE BY DESIGN</div><h1>Your evidence shelf.</h1><p className="page-subtitle">Completed live experiments from this session. Download bundles before leaving.</p>{history.length ? history.map((item, i) => <div className="card history-card" key={i}><div><span className="pill success">LIVE</span><h3>{item.scenario.title}</h3><p>{new Date(item.generatedAt).toLocaleString()} · {item.comparison.equivalent ? 'Equivalent states' : 'Divergent states'}</p></div><div><button className="button secondary" onClick={() => { setReport(item); setView('lab'); setStep(0); }}>Inspect <ArrowRight size={15}/></button><button className="button subtle" onClick={() => download('stateshift-evidence.json', JSON.stringify(evidenceBundle(item), null, 2))}><Download size={16}/> Download</button></div></div>) : <div className="empty-results"><Code2 size={30}/><div><h3>No live evidence yet.</h3><p>Synthetic examples are deliberately excluded from this shelf.</p></div></div>}</section>}

        {view === 'method' && <section className="method-page"><div className="eyebrow">MEASUREMENT BEFORE CLAIMS</div><h1>A small lab. An explicit contract.</h1><p className="page-subtitle">StateShift is an order-sandbox pilot for agent builders, not a certification of multilingual safety.</p><div className="method-grid"><article className="card"><span className="section-num">01</span><h2>What we measure</h2><p>Two prompts start from identical state. NVIDIA Nemotron on Nebius selects and calls real sandbox tools. Deterministic code checks final-state equality, required outcomes, and unauthorized changes.</p><p>Matching states can both be wrong. A refusal can be safe but incomplete. Both distinctions stay visible.</p></article><article className="card"><span className="section-num">02</span><h2>What replay means</h2><p>The optional contract gate re-executes the variant’s exact proposals against a fresh store. It permits only explicitly authorized arguments and blocks duplicate refunds.</p><p>This isolates the gate’s effect on a fixed trace. It does not measure how an adaptive agent behaves after rejection.</p></article><article className="card"><span className="section-num">03</span><h2>What the evidence contains</h2><p>Prompts, explicit expected state, tool arguments and outputs, before/after snapshots, usage, provider request IDs, and the earliest prefix that creates an unauthorized state.</p><p>Exports are editable local records, not cryptographic attestations. Secrets are never included.</p></article><article className="card"><span className="section-num">04</span><h2>Where the claim stops</h2><p>Four synthetic order workflows. Author-created Kazakh, Bangla, Russian and English pilot inputs. No independent native-speaker validation yet. No population-level safety or model-superiority claim.</p><p>A single divergence is an observation, not proof that language caused it. Repeat trials and review semantic equivalence before drawing conclusions.</p></article></div><div className="card sources-card"><h2>Built with respect for prior work</h2><p><a href="https://github.com/sierra-research/tau2-bench" target="_blank" rel="noreferrer">τ-bench</a> evaluates tool-agent interactions, including multilingual tasks. <a href="https://github.com/ethz-spylab/agentdojo" target="_blank" rel="noreferrer">AgentDojo</a> evaluates prompt-injection attacks and defenses. <a href="https://arxiv.org/abs/2601.05366" target="_blank" rel="noreferrer">MLCL</a> studies multilingual tool-calling failures.</p><p>Our pilot focuses on a short, inspectable path from a mixed-language request to a state-level counterexample and an executable regression test.</p></div></section>}
        <footer className="main-footer"><span><Layers3 size={14}/> StateShift · Build agents you can inspect.</span><span>Deterministic checks. Honest evidence.</span></footer>
      </div>
    </main>
  </div>;
}
