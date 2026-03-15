/* ═══════════════════════════════════════════════════════════════
   House · Price · Prediction — App JS
   Developer: Aditya Dwivedi
═══════════════════════════════════════════════════════════════ */

// ── Cursor glow ──────────────────────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  cursorGlow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
});

// ── Particles ────────────────────────────────────────────────
(function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px; height: ${size}px;
      animation-duration: ${Math.random() * 20 + 15}s;
      animation-delay: ${Math.random() * 20}s;
    `;
    container.appendChild(p);
  }
})();

// ── Hero counter animation ────────────────────────────────────
function animateCounter(el, target) {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current);
    if (current >= target) clearInterval(timer);
  }, 20);
}
document.querySelectorAll('.hstat-num').forEach(el => {
  animateCounter(el, parseInt(el.dataset.target));
});

// ── Tab navigation ────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Slider updates ────────────────────────────────────────────
const areaSlider = document.getElementById('area_sqft');
const areaVal    = document.getElementById('area_val');
areaSlider.addEventListener('input', () => { areaVal.textContent = `${areaSlider.value} sqft`; });

const ageSlider = document.getElementById('age_years');
document.getElementById('age_val').textContent = `${ageSlider.value} years`;
ageSlider.addEventListener('input', () => {
  document.getElementById('age_val').textContent = `${ageSlider.value} years`;
});

// EMI sliders
document.getElementById('down_payment_pct').addEventListener('input', function() {
  document.getElementById('dp_val').textContent = `${this.value}%`;
});
document.getElementById('interest_rate').addEventListener('input', function() {
  document.getElementById('ir_val').textContent = `${parseFloat(this.value).toFixed(1)}%`;
});
document.getElementById('tenure_years').addEventListener('input', function() {
  document.getElementById('ten_val').textContent = `${this.value} years`;
});

// ── Counter buttons ───────────────────────────────────────────
const counters = { bedrooms: 3, bathrooms: 2, floors: 2 };
const counterLimits = { bedrooms: [1,10], bathrooms: [1,8], floors: [1,10] };

document.querySelectorAll('.counter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.target;
    const dir = parseInt(btn.dataset.dir);
    const [min, max] = counterLimits[key];
    counters[key] = Math.max(min, Math.min(max, counters[key] + dir));
    document.getElementById(key).textContent = counters[key];
  });
});

// ── Format currency ───────────────────────────────────────────
function formatINR(num) {
  if (num >= 1e7)  return '₹' + (num / 1e7).toFixed(2)  + ' Cr';
  if (num >= 1e5)  return '₹' + (num / 1e5).toFixed(2)  + ' L';
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

// ── Collect form data ─────────────────────────────────────────
function getFormData() {
  return {
    area_sqft:     parseInt(document.getElementById('area_sqft').value),
    city:          document.getElementById('city').value,
    bedrooms:      counters.bedrooms,
    bathrooms:     counters.bathrooms,
    floors:        counters.floors,
    property_type: document.getElementById('property_type').value,
    condition:     document.getElementById('condition').value,
    age_years:     parseInt(document.getElementById('age_years').value),
    garage:        document.getElementById('garage').checked,
    pool:          document.getElementById('pool').checked,
    garden:        document.getElementById('garden').checked,
    furnished:     document.getElementById('furnished').checked,
    solar:         document.getElementById('solar').checked,
    security:      document.getElementById('security').checked,
    gym:           document.getElementById('gym').checked,
  };
}

// ── Chart instances ───────────────────────────────────────────
let trendChartInst = null;
let emiPieChartInst = null;
let marketChartInst = null;

// ── Score ring (mini canvas) ──────────────────────────────────
function drawScoreRing(canvas, score) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 60, 60);
  const cx = 30, cy = 30, r = 24;
  // Track
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 5; ctx.stroke();
  // Fill
  const angle = (score / 100) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, angle);
  ctx.strokeStyle = score > 70 ? '#00d4aa' : score > 40 ? '#d4a017' : '#f05';
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
}

// ── Render result ─────────────────────────────────────────────
function renderResult(data) {
  document.getElementById('resultPlaceholder').hidden = true;
  const content = document.getElementById('resultContent');
  content.hidden = false;

  // Price
  const priceEl = document.getElementById('priceMain');
  priceEl.classList.remove('pulse-price');
  void priceEl.offsetWidth;
  priceEl.classList.add('pulse-price');
  priceEl.textContent = formatINR(data.predicted_price);
  document.getElementById('priceLow').textContent    = formatINR(data.price_low);
  document.getElementById('priceHigh').textContent   = formatINR(data.price_high);
  document.getElementById('pricePerSqft').textContent = data.per_sqft.toLocaleString('en-IN');

  // Confidence
  document.getElementById('confVal').textContent  = `${data.confidence}%`;
  setTimeout(() => {
    document.getElementById('confFill').style.width = `${data.confidence}%`;
  }, 100);

  // Investment score
  document.getElementById('invScore').textContent = `${data.investment_score}/100`;
  const canvas = document.getElementById('scoreRing');
  drawScoreRing(canvas, data.investment_score);

  // Rental yield
  const ry = data.neighborhood ? data.neighborhood.rental_yield : 4.5;
  document.getElementById('rentalYield').textContent = `${ry}%`;

  // Breakdown
  const bd = data.breakdown;
  const maxBd = Math.max(bd.base, bd.bedrooms, bd.bathrooms, bd.amenities) || 1;
  const barsHTML = [
    { label: 'Base + Area', val: bd.base },
    { label: 'Bedrooms',    val: bd.bedrooms },
    { label: 'Bathrooms',   val: bd.bathrooms },
    { label: 'Amenities',   val: bd.amenities },
  ].map(b => `
    <div class="breakdown-bar-row">
      <div class="breakdown-bar-label">
        <span>${b.label}</span>
        <span>${formatINR(b.val)}</span>
      </div>
      <div class="breakdown-bar-track">
        <div class="breakdown-bar-fill" style="width:${Math.max(4, (b.val/maxBd)*100)}%"></div>
      </div>
    </div>
  `).join('');
  document.getElementById('breakdownBars').innerHTML = barsHTML;

  // Trend chart
  document.getElementById('chartCity').textContent = document.getElementById('city').value;
  renderTrendChart(data.trends, 'trendChart', trendChartInst, inst => { trendChartInst = inst; });

  // Neighborhood
  const nb = data.neighborhood;
  if (nb) {
    document.getElementById('nbhGrid').innerHTML = `
      <div class="nbh-item"><div class="nbh-item-label">Avg Price</div><div class="nbh-item-val">${formatINR(nb.avg_price)}</div></div>
      <div class="nbh-item"><div class="nbh-item-label">YoY Appreciation</div><div class="nbh-item-val">+${nb.appreciation}%</div></div>
      <div class="nbh-item"><div class="nbh-item-label">Demand Index</div><div class="nbh-item-val">${nb.demand_index}/100</div></div>
      <div class="nbh-item"><div class="nbh-item-label">Supply Index</div><div class="nbh-item-val">${nb.supply_index}/100</div></div>
    `;
  }
}

function renderTrendChart(trends, canvasId, existing, setter) {
  if (existing) existing.destroy();
  const ctx = document.getElementById(canvasId).getContext('2d');
  const labels = trends.map(t => t.month);
  const values = trends.map(t => t.price);

  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(212,160,23,0.3)');
  gradient.addColorStop(1, 'rgba(212,160,23,0)');

  const inst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '₹/sqft',
        data: values,
        borderColor: '#d4a017',
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointBackgroundColor: '#d4a017',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9090b0', font: { family: 'DM Mono' } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9090b0', font: { family: 'DM Mono' }, callback: v => '₹'+v } }
      }
    }
  });
  setter(inst);
}

// ── PREDICT ───────────────────────────────────────────────────
document.getElementById('predictBtn').addEventListener('click', async () => {
  const btn = document.getElementById('predictBtn');
  btn.querySelector('.btn-text').hidden  = true;
  btn.querySelector('.btn-loader').hidden = false;
  btn.disabled = true;

  try {
    const data = getFormData();
    const res  = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    renderResult(result);
    document.getElementById('resultContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    alert('Prediction failed. Please check the server.');
  } finally {
    btn.querySelector('.btn-text').hidden  = false;
    btn.querySelector('.btn-loader').hidden = true;
    btn.disabled = false;
  }
});

// ── RESET ────────────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', () => {
  areaSlider.value = 1500; areaVal.textContent = '1500 sqft';
  ageSlider.value  = 5; document.getElementById('age_val').textContent = '5 years';
  counters.bedrooms = 3; counters.bathrooms = 2; counters.floors = 2;
  ['bedrooms','bathrooms','floors'].forEach(k => document.getElementById(k).textContent = counters[k]);
  document.querySelectorAll('.amenity-chip input').forEach(cb => cb.checked = false);
  document.getElementById('garage').checked   = true;
  document.getElementById('garden').checked   = true;
  document.getElementById('security').checked = true;
  document.getElementById('resultPlaceholder').hidden = false;
  document.getElementById('resultContent').hidden = true;
});

// ── COMPARE ───────────────────────────────────────────────────
document.getElementById('compareBtn').addEventListener('click', async () => {
  const prop1 = {
    area_sqft: parseInt(document.getElementById('c1_area').value),
    city:      document.getElementById('c1_city').value,
    bedrooms:  parseInt(document.getElementById('c1_beds').value),
    bathrooms: parseInt(document.getElementById('c1_baths').value),
    age_years: parseInt(document.getElementById('c1_age').value),
    property_type: document.getElementById('c1_type').value,
    condition: 'Good',
  };
  const prop2 = {
    area_sqft: parseInt(document.getElementById('c2_area').value),
    city:      document.getElementById('c2_city').value,
    bedrooms:  parseInt(document.getElementById('c2_beds').value),
    bathrooms: parseInt(document.getElementById('c2_baths').value),
    age_years: parseInt(document.getElementById('c2_age').value),
    property_type: document.getElementById('c2_type').value,
    condition: 'Good',
  };

  try {
    const res = await fetch('/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property1: prop1, property2: prop2 })
    });
    const data = await res.json();
    renderCompare(data, prop1, prop2);
  } catch(e) { alert('Compare failed.'); }
});

function renderCompare(data, p1, p2) {
  const r = document.getElementById('compareResult');
  r.hidden = false;

  const winner = data.property1.predicted_price <= data.property2.predicted_price ? 'A' : 'B';

  function colHTML(d, p, label, color) {
    const badge = (label === winner) ? `<span class="winner-badge">✓ Better Value</span>` : '';
    return `
      <h3 style="color:${color}">Property ${label}</h3>
      <div class="cr-price">${formatINR(d.predicted_price)}</div>
      ${badge}
      <div style="margin-top:1rem">
        <div class="cr-row"><span>Per sqft</span><span>₹${d.per_sqft.toLocaleString('en-IN')}</span></div>
        <div class="cr-row"><span>Confidence</span><span>${d.confidence}%</span></div>
        <div class="cr-row"><span>Investment Score</span><span>${d.investment_score}/100</span></div>
        <div class="cr-row"><span>City</span><span>${p.city}</span></div>
        <div class="cr-row"><span>Area</span><span>${p.area_sqft} sqft</span></div>
        <div class="cr-row"><span>Type</span><span>${p.property_type}</span></div>
      </div>
    `;
  }

  document.getElementById('cr1').innerHTML = colHTML(data.property1, p1, 'A', 'var(--accent)');
  document.getElementById('cr2').innerHTML = colHTML(data.property2, p2, 'B', 'var(--accent2)');
  r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── EMI Calculator ────────────────────────────────────────────
document.getElementById('emiBtn').addEventListener('click', async () => {
  const payload = {
    price:            parseFloat(document.getElementById('emi_price').value),
    down_payment_pct: parseFloat(document.getElementById('down_payment_pct').value),
    interest_rate:    parseFloat(document.getElementById('interest_rate').value),
    tenure_years:     parseInt(document.getElementById('tenure_years').value),
  };

  try {
    const res = await fetch('/emi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    renderEMI(d);
  } catch(e) { alert('EMI calculation failed.'); }
});

function renderEMI(d) {
  const r = document.getElementById('emiResult');
  r.hidden = false;
  document.getElementById('emiAmount').textContent  = Math.round(d.emi).toLocaleString('en-IN');
  document.getElementById('loanAmt').textContent    = formatINR(d.loan_amount);
  document.getElementById('downAmt').textContent    = formatINR(d.down_payment);
  document.getElementById('totalPay').textContent   = formatINR(d.total_payment);
  document.getElementById('totalInt').textContent   = formatINR(d.total_interest);

  // Pie chart
  if (emiPieChartInst) emiPieChartInst.destroy();
  const ctx = document.getElementById('emiPieChart').getContext('2d');
  emiPieChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Principal', 'Interest', 'Down Payment'],
      datasets: [{
        data: [d.loan_amount, d.total_interest, d.down_payment],
        backgroundColor: ['#7b61ff', '#d4a017', '#00d4aa'],
        borderColor: '#10101a', borderWidth: 3,
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#9090b0', font: { family: 'DM Mono', size: 11 }, padding: 16 } }
      }
    }
  });
}

// ── Market Dashboard ──────────────────────────────────────────
document.getElementById('marketBtn').addEventListener('click', async () => {
  const city = document.getElementById('marketCity').value;

  try {
    // Fetch market data using the predict endpoint with a neutral property
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area_sqft: 1000, city, bedrooms: 2, bathrooms: 1, floors: 1, age_years: 5, property_type: 'Apartment', condition: 'Good' })
    });
    const data = await res.json();
    renderMarket(data, city);
  } catch(e) { alert('Failed to load market data.'); }
});

function renderMarket(data, city) {
  // Trend chart
  if (marketChartInst) marketChartInst.destroy();
  renderTrendChart(data.trends, 'marketTrendChart', marketChartInst, inst => { marketChartInst = inst; });

  // Stats
  const nb = data.neighborhood;
  document.getElementById('marketStats').innerHTML = [
    { label: 'Average Property Price', val: formatINR(nb.avg_price) },
    { label: 'Year-over-Year Growth',  val: `+${nb.appreciation}%` },
    { label: 'Demand Index',           val: `${nb.demand_index}/100` },
    { label: 'Supply Index',           val: `${nb.supply_index}/100` },
    { label: 'Rental Yield',           val: `${nb.rental_yield}%` },
  ].map(s => `
    <div class="market-stat-row">
      <span>${s.label}</span>
      <span class="market-stat-val">${s.val}</span>
    </div>
  `).join('');

  // City comparison bars
  const cities = {
    'Mumbai': 3.2, 'Delhi': 2.8, 'Gurgaon': 2.6, 'Bangalore': 2.5,
    'Noida': 2.3, 'Hyderabad': 2.1, 'Chennai': 2.0, 'Pune': 1.9,
    'Chandigarh': 1.8, 'Kolkata': 1.7
  };
  const maxMult = 3.2;
  document.getElementById('cityBars').innerHTML = Object.entries(cities).map(([c, m]) => `
    <div class="city-bar-row">
      <div class="city-bar-label">${c}</div>
      <div class="city-bar-track">
        <div class="city-bar-fill" style="width:${(m/maxMult)*100}%"></div>
      </div>
      <div class="city-bar-val">₹${Math.round(m * 4500)}/sqft</div>
    </div>
  `).join('');
}

// Auto-load market on page load
setTimeout(() => {
  document.getElementById('marketBtn').click();
}, 500);
