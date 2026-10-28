/* Avenue 88: Past Transactions search. Data: data/transactions.json (built by csv_to_json.py). */
(() => {
  const WA = 'https://wa.me/6580830688';
  const $ = s => document.querySelector(s);
  const agentsEl = $('#a88-agents');
  if (!agentsEl) return;
  const agents = JSON.parse(agentsEl.textContent);
  const A = Object.fromEntries(agents.map(a => [a.slug, a]));
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dnum = d => parseInt(String(d || '').replace(/\D/g, ''), 10) || 0;
  const region = d => { const n = dnum(d); if (!n) return ''; if (n <= 13 || n === 20) return 'Central'; if (n <= 18) return 'East'; if (n === 19 || n === 28) return 'North-East'; if (n <= 24) return 'West'; return 'North'; };
  const fmtMonth = m => { const [y, mm] = String(m).split('-'); return (MON[+mm - 1] || '') + ' ' + y; };
  const waLink = a => `${WA}?text=${encodeURIComponent(`Hi, I'd like to speak with ${a.first} from Avenue 88.`)}`;
  const ICON = {
    HDB: '<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-5h6v5"/>',
    Condo: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    Landed: '<path d="M3 11l9-7 9 7"/><path d="M5 10v11h14V10"/><path d="M10 21v-6h4v6"/>',
    Commercial: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v12h16V9"/><path d="M3 9h18M9 21v-6h6v6"/>'
  };
  const icon = t => `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[t] || ICON.Condo}</svg>`;
  const WAI = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm5.5-5.8c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>';

  const el = { q: $('#tx-q'), agent: $('#tx-agent'), ptype: $('#tx-ptype'), ttype: $('#tx-ttype'), year: $('#tx-year'),
    count: $('#tx-count'), list: $('#tx-results'), stats: $('#tx-agents'), reset: $('#tx-reset'), banner: $('#tx-banner'), form: $('#tx-form') };
  let rows = [], example = true;

  function agentCards() {
    el.stats.innerHTML = agents.map(a => {
      const mine = rows.filter(r => r.agent === a.slug);
      const regions = [...new Set(mine.map(r => region(r.district)).filter(Boolean))];
      const types = [...new Set(mine.map(r => r.property_type))];
      const sales = mine.filter(r => r.transaction_type === 'Sale').length;
      const latest = mine.map(r => r.month).sort().pop();
      const stats = mine.length ? `
        <li><span>Transactions listed</span><b>${mine.length}</b></li>
        <li><span>Property types</span><b>${esc(types.join(', '))}</b></li>
        <li><span>Sales / rentals</span><b>${sales} / ${mine.length - sales}</b></li>
        <li><span>Most recent</span><b>${esc(fmtMonth(latest))}</b></li>` : '<li class="none">No transactions listed yet</li>';
      return `<article class="ag-card" data-agent="${a.slug}">
        <div class="ag-photo"><img src="img/team-${a.slug}.webp" alt="${esc(a.name)}" loading="lazy" width="480" height="632">
          <ul class="ag-regions">${regions.map(r => `<li>${esc(r)}</li>`).join('')}</ul>${example ? '<span class="tx-sample">Sample</span>' : ''}</div>
        <div class="ag-body"><h3>${esc(a.name)}</h3><p class="ag-title">${a.tag}</p>
          <ul class="ag-stats">${stats}</ul>
          <button class="ag-view" type="button" aria-pressed="false" data-agent="${a.slug}">See ${esc(a.first)}'s transactions</button></div>
      </article>`;
    }).join('');
    el.stats.querySelectorAll('.ag-view').forEach(b => b.addEventListener('click', () => {
      el.agent.value = el.agent.value === b.dataset.agent ? '' : b.dataset.agent;
      render(true);
      if (el.agent.value) document.getElementById('tx-search').scrollIntoView({ behavior: 'smooth' });
    }));
  }

  function matchQ(r, q) {
    if (!q) return true;
    const m = q.match(/^(?:d|district)\s*(\d{1,2})$/i) || q.match(/^(\d{1,2})$/);
    if (m) return dnum(r.district) === +m[1];
    const hay = [r.project, r.district, 'district ' + dnum(r.district), region(r.district), r.notes].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  }

  function card(r) {
    const a = A[r.agent] || { slug: r.agent, name: r.agent, first: r.agent };
    const media = r.photo ? `<img src="img/transactions/${esc(r.photo)}" alt="${esc(r.project)}" loading="lazy">` : `<div class="tx-ico">${icon(r.property_type)}</div>`;
    const price = r.price ? `<li>S$${Number(r.price).toLocaleString('en-SG')}</li>` : '';
    return `<article class="tx-card">
      <div class="tx-media t-${esc(r.property_type).toLowerCase()}">${media}
        ${example ? '<span class="tx-sample">Sample</span>' : ''}<span class="tx-badge ${r.transaction_type === 'Rental' ? 'rent' : 'sale'}">${esc(r.transaction_type)}</span></div>
      <div class="tx-body">
        <div class="tx-meta">${esc(r.property_type)} &middot; ${esc(r.district)}${region(r.district) ? ' &middot; ' + region(r.district) : ''}</div>
        <h3>${esc(r.project)}</h3>
        <ul class="tx-facts"><li>${esc(fmtMonth(r.month))}</li><li>Represented the ${esc(r.represented)}</li>${price}</ul>
        ${r.notes ? `<p class="tx-notes">${esc(r.notes)}</p>` : ''}
        <div class="tx-foot"><span class="tx-agent"><img src="img/team-${esc(a.slug)}.webp" alt="" width="40" height="40" loading="lazy">${esc(a.name)}</span>
          <a class="btn btn-wa" href="${waLink(a)}" target="_blank" rel="noopener">${WAI}Talk to ${esc(a.first)}</a></div>
      </div></article>`;
  }

  function render(updateUrl) {
    const f = { q: el.q.value.trim(), agent: el.agent.value, type: el.ptype.value, txn: el.ttype.value, year: el.year.value };
    const out = rows.filter(r => matchQ(r, f.q) && (!f.agent || r.agent === f.agent) && (!f.type || r.property_type === f.type)
      && (!f.txn || r.transaction_type === f.txn) && (!f.year || r.month.startsWith(f.year)));
    const noun = rows.length === 1 ? 'transaction' : 'transactions';
    el.count.textContent = `Showing ${out.length} of ${rows.length} ${example ? 'example ' : ''}${noun}` + (f.agent && A[f.agent] ? ` for ${A[f.agent].name}` : '');
    el.list.innerHTML = out.length ? out.map(card).join('') : `<div class="tx-empty"><h3>Nothing matches those filters yet.</h3><p>Try clearing a filter, or WhatsApp us and we'll check our records for you.</p><button type="button" class="btn btn-ghost" data-reset>Clear filters</button></div>`;
    const rb = el.list.querySelector('[data-reset]'); rb && rb.addEventListener('click', reset);
    el.stats.querySelectorAll('.ag-card').forEach(c => { const on = c.dataset.agent === f.agent; c.classList.toggle('active', on); c.querySelector('.ag-view').setAttribute('aria-pressed', on); });
    if (updateUrl) {
      const p = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => v && p.set(k, v));
      history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash);
    }
  }

  function reset() { el.form.reset(); render(true); }

  function fromUrl() {
    const p = new URLSearchParams(location.search);
    const set = (sel, v) => { if (v && [...sel.options].some(o => o.value === v)) sel.value = v; };
    if (p.get('q')) el.q.value = p.get('q');
    set(el.agent, p.get('agent')); set(el.ptype, p.get('type')); set(el.ttype, p.get('txn')); set(el.year, p.get('year'));
  }

  fetch('data/transactions.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
    rows = (d.transactions || []).slice().sort((a, b) => b.month.localeCompare(a.month));
    example = d.example !== false;
    if (!example && el.banner) el.banner.hidden = true;
    document.querySelectorAll('[data-example-only]').forEach(n => n.hidden = !example);
    const years = [...new Set(rows.map(r => r.month.slice(0, 4)))].sort().reverse();
    el.year.insertAdjacentHTML('beforeend', years.map(y => `<option value="${y}">${y}</option>`).join(''));
    agentCards(); fromUrl(); render(false);
    [el.agent, el.ptype, el.ttype, el.year].forEach(s => s.addEventListener('change', () => render(true)));
    el.q.addEventListener('input', () => render(true));
    el.form.addEventListener('submit', e => { e.preventDefault(); render(true); });
    el.reset.addEventListener('click', reset);
  }).catch(() => {
    el.count.textContent = '';
    el.list.innerHTML = '<div class="tx-empty"><h3>We couldn\'t load the transactions just now.</h3><p>Please refresh the page, or WhatsApp us and we\'ll share them directly.</p></div>';
  });
})();
