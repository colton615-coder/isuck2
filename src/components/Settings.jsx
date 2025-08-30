import React, { useEffect, useState } from 'react';
import { getMeta, setMeta } from '../lib/db.js';

const DEFAULT_CATS = ['Food & Drink','Travel','Shopping','Bills','Transport','Entertainment','Health','Other'];

export default function Settings() {
  const [budget, setBudget] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [categories, setCategories] = useState(DEFAULT_CATS);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    (async () => {
      setBudget(await getMeta('budgetMonthly', 0));
      setCurrency(await getMeta('currency','USD'));
      setCategories(await getMeta('categories', DEFAULT_CATS));
    })();
  }, []);

  const save = async () => {
    await setMeta('budgetMonthly', Number(budget) || 0);
    await setMeta('currency', currency);
    await setMeta('categories', categories);
    alert('Saved');
  };

  const addCat = () => {
    const v = newCat.trim();
    if (!v) return;
    if (categories.includes(v)) return alert('Already exists.');
    setCategories([...categories, v]); setNewCat('');
  };
  const delCat = (c) => setCategories(categories.filter(x=>x!==c));
  const resetCats = () => setCategories(DEFAULT_CATS);

  return (
    <section className="grid">
      <div className="card grid">
        <label>
          <div className="small">Monthly Budget</div>
          <input className="input" type="number" min="0" value={budget} onChange={e=>setBudget(e.target.value)} />
        </label>
        <label>
          <div className="small">Currency</div>
          <select value={currency} onChange={e=>setCurrency(e.target.value)}>
            {['USD','EUR','GBP','JPY','AUD','CAD','INR'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <div className="small">Categories</div>
        <div className="chips">
          {categories.map(c => (
            <span key={c} className="chip">{c} <button className="small" onClick={()=>delCat(c)} aria-label={`Delete ${c}`}>✕</button></span>
          ))}
        </div>
        <div className="row">
          <input className="input" placeholder="Add category" value={newCat} onChange={e=>setNewCat(e.target.value)} />
          <button className="btn" onClick={addCat}>Add</button>
          <button className="btn ghost" onClick={resetCats}>Reset</button>
        </div>

        <button className="btn" onClick={save}>Save Settings</button>
      </div>

      <div className="card small">
        Tip: On iPhone, open in Safari and use <b>Share → Add to Home Screen</b> for the best PWA experience.
      </div>
    </section>
  );
}
