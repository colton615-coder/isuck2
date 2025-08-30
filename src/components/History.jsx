import React, { useEffect, useMemo, useState } from 'react';
import { allTx, delTx, getMeta } from '../lib/db.js';
import { fmtMoney } from '../utils/format.js';

const groupByMonth = (items) => {
  const map = new Map();
  for (const t of items) {
    const d = new Date(t.date);
    const key = `${d.toLocaleString(undefined,{month:'long'})} ${d.getFullYear()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  return map;
};

export default function History() {
  const [items, setItems] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [query, setQuery] = useState('');

  const load = async () => {
    setItems(await allTx());
    setCurrency(await getMeta('currency','USD'));
  };
  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(() =>
    items.filter(t => (t.note?.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase()))),
    [items, query]
  );

  const groups = useMemo(()=> groupByMonth(filtered), [filtered]);

  const onDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await delTx(id);
    load();
  };

  return (
    <section className="grid">
      <div className="row">
        <input className="input" placeholder="Search notes or categories" value={query} onChange={e=>setQuery(e.target.value)} />
      </div>
      {[...groups.entries()].map(([month, list]) => (
        <div key={month} className="grid">
          <div className="small" style={{marginTop:'8px'}}>{month}</div>
          <div className="list">
            {list.map(t => (
              <div key={t.id} className="item">
                <div>
                  <div>{t.category} <span className="small">• {new Date(t.date).toLocaleDateString()}</span></div>
                  {t.note && <div className="small">{t.note}</div>}
                </div>
                <div className="mono" style={{color: t.type==='expense'?'var(--danger)':'var(--brand)'}}>
                  {t.type==='expense' ? '-' : '+'}{fmtMoney(t.amount, t.currency || currency)}
                  <div className="small">{t.currency}</div>
                </div>
                <button className="btn danger" onClick={()=>onDelete(t.id)} aria-label="Delete">Delete</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {items.length===0 && <p className="center small">No entries yet.</p>}
    </section>
  );
}
