import React, { useEffect, useMemo, useRef, useState } from 'react';
import { allTx, getMeta } from '../lib/db.js';
import { fmtMoney, startOfMonth, startOfWeek, ymKey } from '../utils/format.js';
import Chart from 'chart.js/auto';

const total = (arr, pred) => arr.filter(pred).reduce((s,t)=>s+t.amount*(t.type==='expense'?-1:1),0);

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState(0);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    (async () => {
      setItems(await allTx());
      setBudget(await getMeta('budgetMonthly', 0));
      setCurrency(await getMeta('currency', 'USD'));
    })();
  }, []);

  const now = new Date();
  const wStart = startOfWeek(now);
  const mStart = startOfMonth(now);

  const weekItems = useMemo(() => items.filter(t => new Date(t.date) >= wStart), [items]);
  const monthItems = useMemo(() => items.filter(t => new Date(t.date) >= mStart), [items]);

  const spentWeek = useMemo(() => total(weekItems, _=>true), [weekItems]);
  const spentMonth = useMemo(() => total(monthItems, _=>true), [monthItems]);

  const byCategory = useMemo(() => {
    const m = new Map();
    for (const t of monthItems) {
      const delta = t.amount * (t.type==='expense' ? 1 : -1);
      m.set(t.category, (m.get(t.category)||0) + delta);
    }
    return [...m.entries()].filter(([_,v]) => v>0).sort((a,b)=>b[1]-a[1]);
  }, [monthItems]);

  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: byCategory.map(([k])=>k),
        datasets: [{ label: 'This Month', data: byCategory.map(([_,v])=>v) }]
      },
      options: { responsive: true, plugins: { legend: { display: false }}, scales: { y: { ticks: { precision: 0 }}} }
    });
    return () => chart.destroy();
  }, [byCategory]);

  const remaining = Math.max(0, budget - Math.max(0, -spentMonth));
  const over = budget > 0 && -spentMonth > budget;

  return (
    <section className="grid">
      <div className="card">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>
            <div className="small">This Week</div>
            <div className="title mono">{fmtMoney(-spentWeek, currency)}</div>
          </div>
          <div>
            <div className="small">This Month</div>
            <div className="title mono">{fmtMoney(-spentMonth, currency)}</div>
          </div>
        </div>
        <div className="small">Budget {budget ? `• ${fmtMoney(budget, currency)} (${ymKey()})` : 'not set'}</div>
        {budget ? (
          <div className="row" style={{marginTop:'8px', justifyContent:'space-between'}}>
            <div className="small">Remaining</div>
            <div className="mono" style={{fontWeight:700, color: over?'var(--danger)':'var(--brand)'}}>
              {fmtMoney(remaining, currency)} {over ? '• Over budget' : ''}
            </div>
          </div>
        ) : null}
      </div>

      <div className="card grid">
        <div className="small">Spending by Category (This Month)</div>
        <canvas ref={canvasRef} height="160" aria-label="Spending chart"></canvas>
        {byCategory.length===0 && <div className="small">No spending yet this month.</div>}
      </div>
    </section>
  );
}