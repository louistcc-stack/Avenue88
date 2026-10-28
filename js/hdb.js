/* HDB upgrade calculator. Edit CONFIG when rules change. Indicative only, not a bank quote. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') boot(api);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const CONFIG = {
    rulesAsOf: '2026',
    tdsr: 0.55,
    stressRate: 0.04,
    maxTenureYears: 30,
    loanAgeCap: 65,
    ltv: 0.75,
    minCashDown: 0.05,
    absdCitizenSecond: 0.20,
    hdbSellWithinMonths: 6,
    /* Residential BSD: 1% first 180k, 2% next 180k, 3% next 640k, 4% next 500k, 5% next 1.5m, 6% above 3m. */
    bsdBands: [
      { width: 180000, rate: 0.01 },
      { width: 180000, rate: 0.02 },
      { width: 640000, rate: 0.03 },
      { width: 500000, rate: 0.04 },
      { width: 1500000, rate: 0.05 },
      { width: Infinity, rate: 0.06 }
    ],
    budgetRound: 1000,
    searchCap: 20000000,
    example: { sale: 650000, loan: 180000, cpf: 220000, savings: 80000, age: 38, income: 12000, debts: 500 },
    timelineMin: 30,
    timelineMax: 55,
    milestones: [30, 35, 40, 45, 50, 55]
  };

  function num(v) {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    return Number.isFinite(n) ? n : NaN;
  }

  function tenureYears(age) {
    if (!Number.isFinite(age)) return 0;
    return Math.max(0, Math.min(CONFIG.maxTenureYears, CONFIG.loanAgeCap - age));
  }

  /* Standard fully amortising loan. monthly = payment, annualRate = stress rate, years = tenure. */
  function loanFromMonthly(monthly, annualRate, years) {
    if (!(monthly > 0) || !(years > 0)) return 0;
    const r = annualRate / 12;
    const n = years * 12;
    const pow = Math.pow(1 + r, n);
    return monthly * (pow - 1) / (r * pow);
  }

  function bsd(price) {
    if (!(price > 0)) return 0;
    let left = price, tax = 0;
    for (let i = 0; i < CONFIG.bsdBands.length; i++) {
      const band = CONFIG.bsdBands[i];
      const slice = Math.min(left, band.width);
      tax += slice * band.rate;
      left -= slice;
      if (left <= 0) break;
    }
    return tax;
  }

  function canAfford(price, cash, cpf, tdsrLoan) {
    const loan = Math.min(price * CONFIG.ltv, Math.max(0, tdsrLoan));
    const down = price - loan;
    const stamp = bsd(price);
    const cashMin = price * CONFIG.minCashDown;
    const totalNeed = down + stamp;
    const ok = cash + 1e-6 >= cashMin && cash + cpf + 1e-6 >= totalNeed;
    return { ok: ok, loan: loan, down: down, bsd: stamp, cashMin: cashMin, totalNeed: totalNeed };
  }

  function maxBudget(cash, cpf, tdsrLoan) {
    if (!(cash >= 0)) return { price: 0, loan: 0, down: 0, bsd: 0, cashMin: 0, totalNeed: 0, limit: 'shortfall' };
    let lo = 0;
    let hi = CONFIG.searchCap;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (canAfford(mid, cash, cpf, tdsrLoan).ok) lo = mid;
      else hi = mid;
    }
    let price = Math.floor(lo / CONFIG.budgetRound) * CONFIG.budgetRound;
    let detail = canAfford(price, cash, cpf, tdsrLoan);
    while (price > 0 && !detail.ok) {
      price -= CONFIG.budgetRound;
      detail = canAfford(price, cash, cpf, tdsrLoan);
    }
    const ltvLoan = price * CONFIG.ltv;
    let limit = 'funds';
    if (price <= 0) limit = 'none';
    else if (tdsrLoan + 1 < ltvLoan) limit = 'income';
    else if (cash <= price * CONFIG.minCashDown + CONFIG.budgetRound) limit = 'cash';
    else limit = 'ltv';
    return {
      price: price,
      loan: detail.loan,
      down: detail.down,
      bsd: detail.bsd,
      cashMin: detail.cashMin,
      totalNeed: detail.totalNeed,
      limit: limit
    };
  }

  function compute(input) {
    const sale = num(input.sale), outstanding = num(input.loan), cpf = num(input.cpf);
    const savings = num(input.savings), age = num(input.age), income = num(input.income), debts = num(input.debts);
    const values = [sale, outstanding, cpf, savings, age, income, debts];
    if (values.some(function (v) { return !Number.isFinite(v) || v < 0; })) {
      return { ok: false, error: 'Use numbers that are 0 or higher.' };
    }
    const years = tenureYears(age);
    const tdsrRoom = income * CONFIG.tdsr;
    const instalment = Math.max(0, tdsrRoom - debts);
    const tdsrLoan = loanFromMonthly(instalment, CONFIG.stressRate, years);
    const afterLoan = sale - outstanding;
    const cpfRefund = afterLoan > 0 ? Math.min(cpf, afterLoan) : 0;
    const cashProceeds = afterLoan - cpfRefund;
    const cashAvailable = savings + cashProceeds;
    const budget = maxBudget(cashAvailable, cpfRefund, tdsrLoan);
    let saleNote = 'ok';
    if (afterLoan < 0) saleNote = 'shortfall';
    else if (cpfRefund + 0.5 < cpf) saleNote = 'partial-cpf';
    return {
      ok: true,
      sale: sale,
      outstanding: outstanding,
      cpf: cpf,
      savings: savings,
      age: age,
      income: income,
      debts: debts,
      years: years,
      tdsrRoom: tdsrRoom,
      instalment: instalment,
      tdsrLoan: tdsrLoan,
      afterLoan: afterLoan,
      cpfRefund: cpfRefund,
      cashProceeds: cashProceeds,
      cashAvailable: cashAvailable,
      budget: budget.price,
      budgetLoan: budget.loan,
      down: budget.down,
      bsdAtBudget: budget.bsd,
      cashMin: budget.cashMin,
      totalNeed: budget.totalNeed,
      limit: budget.limit,
      saleNote: saleNote,
      debtsOver: debts > tdsrRoom
    };
  }

  return { CONFIG: CONFIG, bsd: bsd, tenureYears: tenureYears, loanFromMonthly: loanFromMonthly, canAfford: canAfford, compute: compute };
});

function boot(api) {
  const CONFIG = api.CONFIG;
  const ex = CONFIG.example;
  const keys = ['sale', 'loan', 'cpf', 'savings', 'age', 'income', 'debts'];
  const money = function (n) {
    const sign = n < 0 ? '-' : '';
    return sign + 'S$' + Math.round(Math.abs(n)).toLocaleString('en-SG');
  };
  const shortMoney = function (n) {
    const sign = n < 0 ? '-' : '';
    const v = Math.abs(n);
    if (v >= 1000000) return sign + 'S$' + (v / 1000000).toFixed(1) + 'm';
    if (v >= 10000) return sign + 'S$' + Math.round(v / 1000) + 'k';
    return money(n);
  };
  const field = function (k) { return document.getElementById('in-' + k); };
  const read = function () {
    const o = {};
    keys.forEach(function (k) { o[k] = field(k).value; });
    return o;
  };
  const isExample = function (o) {
    return keys.every(function (k) { return numEq(o[k], ex[k]); });
  };
  function numEq(a, b) { return Number(a) === Number(b); }

  function limitCopy(r) {
    if (!r.ok) return '';
    if (r.budget <= 0 && r.cashAvailable < 0) return 'After the sale there isn’t enough cash left for a downpayment. The budget below is S$0 until savings cover the shortfall.';
    if (r.years <= 0) return 'A bank loan in this sketch has to finish by age ' + CONFIG.loanAgeCap + '. At this age the tenure is 0, so the new loan is S$0 and the budget is whatever cash and CPF can buy.';
    if (r.debtsOver) return 'Existing debts already use up the 55% TDSR room, so this sketch shows no new home loan. The budget is whatever cash and CPF can buy.';
    if (r.limit === 'income') return 'Income sets the loan. It is smaller than 75% of the price, so the downpayment is more than 25%.';
    if (r.limit === 'cash') return 'Cash sets the budget. At least 5% of the price has to be paid in cash, even when CPF covers the rest.';
    return 'The 75% loan cap sets this budget, so the downpayment is 25%, and at least 5% of the price is cash.';
  }

  function saleCopy(r) {
    if (r.saleNote === 'shortfall') return 'The sale price doesn’t cover the outstanding loan, so you’d need about ' + money(Math.abs(r.cashProceeds)) + ' more before any CPF is refunded. Savings are counted against that gap.';
    if (r.saleNote === 'partial-cpf') return 'The loan is cleared first. There isn’t enough left to refund the full CPF amount, so the refund stops at what’s left and cash proceeds are ' + money(r.cashProceeds) + '.';
    return 'The loan is paid off first, then CPF (including the accrued interest you entered) goes back to your OA. What’s left is cash.';
  }

  function renderStats(r) {
    const dl = document.getElementById('out-stats');
    dl.replaceChildren();
    const rows = [
      ['Estimated cash proceeds', money(r.cashProceeds)],
      ['CPF refund to your OA', money(r.cpfRefund)],
      ['Cash you could use (proceeds + savings)', money(r.cashAvailable)],
      ['Monthly room for a new loan', money(r.instalment)],
      ['Max tenure', (Math.round(r.years * 10) / 10) + ' years'],
      ['Max loan from income (TDSR, 4% stress test)', money(r.tdsrLoan)],
      ['Loan used at that budget', money(r.budgetLoan)],
      ['Downpayment', money(r.down) + (r.budget > 0 ? ' (' + Math.round(r.down / r.budget * 100) + '%)' : '')],
      ['Minimum cash downpayment (5%)', money(r.cashMin)],
      ['BSD on that purchase', money(r.bsdAtBudget)]
    ];
    rows.forEach(function (row) {
      const dt = document.createElement('dt');
      dt.textContent = row[0];
      const dd = document.createElement('dd');
      dd.textContent = row[1];
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
  }

  function renderBars(income, debts) {
    const host = document.getElementById('age-bars');
    const instalment = Math.max(0, income * CONFIG.tdsr - debts);
    const amounts = CONFIG.milestones.map(function (age) {
      return api.loanFromMonthly(instalment, CONFIG.stressRate, api.tenureYears(age));
    });
    const max = Math.max.apply(null, amounts.concat([1]));
    const current = Number(field('age').value);
    host.replaceChildren();
    CONFIG.milestones.forEach(function (age, i) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'age-col' + (age === current ? ' on' : '');
      btn.dataset.age = String(age);
      const bar = document.createElement('span');
      bar.className = 'bar';
      bar.style.height = Math.max(8, Math.round(amounts[i] / max * 120)) + 'px';
      const ageEl = document.createElement('b');
      ageEl.textContent = String(age);
      const amt = document.createElement('small');
      amt.textContent = shortMoney(amounts[i]);
      btn.appendChild(bar);
      btn.appendChild(ageEl);
      btn.appendChild(amt);
      btn.addEventListener('click', function () {
        field('age').value = String(age);
        document.getElementById('age-slider').value = String(age);
        render();
      });
      host.appendChild(btn);
    });
    const loan30 = api.loanFromMonthly(instalment, CONFIG.stressRate, api.tenureYears(35));
    const loan50 = api.loanFromMonthly(instalment, CONFIG.stressRate, api.tenureYears(50));
    document.getElementById('age-compare').textContent = instalment <= 0
      ? 'With these debts there is no TDSR room left, so the bars stay at S$0 at every age.'
      : 'Same income and debts: about ' + money(loan30) + ' at age 35 (' + api.tenureYears(35) + ' years) and about ' + money(loan50) + ' at age 50 (' + api.tenureYears(50) + ' years).';
  }

  let last = null;

  function render() {
    const input = read();
    const r = api.compute(input);
    last = r.ok ? r : null;
    const flag = document.getElementById('ex-flag');
    flag.hidden = !isExample(input);
    const budgetEl = document.getElementById('out-budget');
    const limitEl = document.getElementById('out-limit');
    const saleEl = document.getElementById('out-sale');
    const errEl = document.getElementById('out-error');
    if (!r.ok) {
      budgetEl.textContent = '—';
      limitEl.textContent = '';
      saleEl.textContent = '';
      errEl.hidden = false;
      errEl.textContent = r.error;
      document.getElementById('out-stats').replaceChildren();
      return;
    }
    errEl.hidden = true;
    budgetEl.textContent = money(r.budget);
    limitEl.textContent = limitCopy(r);
    saleEl.textContent = saleCopy(r);
    renderStats(r);
    const age = Number(input.age);
    const slider = document.getElementById('age-slider');
    if (age >= CONFIG.timelineMin && age <= CONFIG.timelineMax) slider.value = String(age);
    const years = r.years;
    document.getElementById('age-readout').textContent = 'Age ' + (Number.isFinite(age) ? age : '–') + ': ' + (Math.round(years * 10) / 10) + ' years, max loan about ' + money(r.tdsrLoan) + '.';
    renderBars(r.income, r.debts);
  }

  function snapshot(source) {
    const input = read();
    const r = api.compute(input);
    const show = function (v) { return Number.isFinite(v) ? money(v) : String(v); };
    const lines = [
      'From the ' + source + ' on the HDB upgrading page' + (isExample(input) ? ' (example numbers)' : ''),
      'HDB sale price: ' + show(r.ok ? r.sale : input.sale),
      'Outstanding HDB loan: ' + show(r.ok ? r.outstanding : input.loan),
      'CPF used incl. accrued interest: ' + show(r.ok ? r.cpf : input.cpf),
      'Cash savings: ' + show(r.ok ? r.savings : input.savings),
      'Age of oldest buyer: ' + input.age,
      'Combined monthly income: ' + show(r.ok ? r.income : input.income),
      'Existing monthly debts: ' + show(r.ok ? r.debts : input.debts)
    ];
    if (r && r.ok) {
      lines.push(
        'Cash proceeds: ' + money(r.cashProceeds),
        'CPF refund: ' + money(r.cpfRefund),
        'Max tenure: ' + r.years + ' years',
        'Max loan (TDSR 55%, 4% stress test): ' + money(r.tdsrLoan),
        'Indicative budget for next private home: ' + money(r.budget),
        'BSD at that budget: ' + money(r.bsdAtBudget),
        'Downpayment at that budget: ' + money(r.down)
      );
    }
    return lines.join('\n');
  }

  function prefill(source) {
    const text = snapshot(source);
    const box = document.getElementById('u-calc');
    box.value = text;
    const wa = document.getElementById('wa-roadmap');
    const msg = 'Hi Avenue 88! I would like a free HDB upgrade roadmap.\n\n' + text;
    wa.href = 'https://wa.me/6580830688?text=' + encodeURIComponent(msg);
    document.getElementById('roadmap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const name = document.getElementById('u-name');
    if (name && !name.value) name.focus({ preventScroll: true });
  }

  keys.forEach(function (k) { field(k).addEventListener('input', render); });
  document.getElementById('age-slider').addEventListener('input', function (e) {
    field('age').value = e.target.value;
    render();
  });
  document.getElementById('reset-example').addEventListener('click', function () {
    keys.forEach(function (k) { field(k).value = String(ex[k]); });
    document.getElementById('age-slider').value = String(ex.age);
    render();
  });
  document.querySelectorAll('.js-roadmap').forEach(function (btn) {
    btn.addEventListener('click', function () { prefill(btn.getAttribute('data-from') || 'calculator'); });
  });

  const tabs = document.querySelectorAll('[data-ascend]');
  function showStep(id) {
    tabs.forEach(function (tab) {
      const on = tab.getAttribute('data-ascend') === id;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== id;
    });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { showStep(tab.getAttribute('data-ascend')); });
  });
  showStep('a');
  render();
}
