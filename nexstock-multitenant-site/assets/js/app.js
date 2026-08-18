/* NexStock — shared app logic: language, cart, wishlist, auth, header/footer, helpers
   Multi-tenant: TENANT / TENANTS / ACTIVE_TENANT_ID come from data.js (loaded first). Cart,
   wishlist and the logged-in user are namespaced per tenant so switching storefronts never
   mixes one tenant's basket or account with another's — each tenant is a fully isolated store. */

const LS = { lang:'nexstock-lang', cart:'nexstock-cart-'+ACTIVE_TENANT_ID, wish:'nexstock-wishlist-'+ACTIVE_TENANT_ID, user:'nexstock-user-'+ACTIVE_TENANT_ID };

/* ---------- tenant theme + switcher ---------- */
function applyTenantTheme(){
  const vars = TENANT.theme.vars;
  const root = document.documentElement.style;
  Object.keys(vars).forEach(k => root.setProperty('--'+k, vars[k]));
  let fontLink = document.getElementById('tenant-font-link');
  if (!fontLink){ fontLink = document.createElement('link'); fontLink.id = 'tenant-font-link'; fontLink.rel = 'stylesheet'; document.head.appendChild(fontLink); }
  if (fontLink.href !== TENANT.theme.googleFontsHref) fontLink.href = TENANT.theme.googleFontsHref;
  document.title = document.title.replace(/NexStock|PawLuxe/g, TENANT.name);
}
function switchTenant(id){ if (id === ACTIVE_TENANT_ID) return; setActiveTenantId(id); location.href = 'index.html'; }
function tenantSwitcherHtml(){
  const items = Object.values(TENANTS).map(tn => `<div class="tn-opt ${tn.id===ACTIVE_TENANT_ID?'on':''}" onclick="switchTenant('${tn.id}')"><span class="tn-emoji">${tn.emoji}</span><span><span class="tn-name">${tn.name}</span><span class="tn-niche">${isAr() ? tn.blurb.ar : tn.blurb.en}</span></span>${tn.id===ACTIVE_TENANT_ID?'<span class="tn-check">✓</span>':''}</div>`).join('');
  return `<div class="tn-switch" id="tn-switch">
    <button class="tn-trigger" id="tn-trigger" type="button"><span class="tn-emoji">${TENANT.emoji}</span>${TENANT.name}<span class="tn-caret">▾</span></button>
    <div class="tn-menu" id="tn-menu">
      <div class="tn-menu-label">${isAr() ? 'التبديل بين المتاجر' : 'Switch storefront'}</div>
      ${items}
      <a class="tn-all" href="storefronts.html">${isAr() ? 'عرض كل المتاجر →' : 'View all storefronts →'}</a>
    </div>
  </div>`;
}

function getLang(){ return localStorage.getItem(LS.lang) || 'en'; }
function setLang(l){ localStorage.setItem(LS.lang, l); location.reload(); }
function isAr(){ return getLang() === 'ar'; }
function t(ns){ return I18N[getLang()][ns]; }
function tc(){ return I18N[getLang()]; }

function fmt(x){ return 'CFA ' + Math.round(x).toLocaleString('en-US'); }

function getCart(){ try { return JSON.parse(localStorage.getItem(LS.cart)) || {}; } catch(e){ return {}; } }
function saveCart(c){ localStorage.setItem(LS.cart, JSON.stringify(c)); }
function addToCart(id, qty){ qty = qty || 1; const c = getCart(); c[id] = (c[id]||0) + qty; saveCart(c); updateCartBadge(); showToast(isAr() ? 'أُضيف إلى السلة ✓' : 'Added to cart ✓'); }
function setCartQty(id, qty){ const c = getCart(); if (qty <= 0) delete c[id]; else c[id] = qty; saveCart(c); }
function removeFromCart(id){ const c = getCart(); delete c[id]; saveCart(c); }
function cartCount(){ const c = getCart(); return Object.values(c).reduce((a,n)=>a+n,0); }
function cartLines(){ const c = getCart(); return Object.keys(c).map(id => { const p = getProduct(id); if (!p) return null; const qty = c[id]; return { p, qty, line: p.price*qty }; }).filter(Boolean); }
function cartSubtotal(){ return cartLines().reduce((a,l)=>a+l.line,0); }
function updateCartBadge(){ const el = document.getElementById('cart-count'); if (el) el.textContent = cartCount(); }

function getWishlist(){ try { return JSON.parse(localStorage.getItem(LS.wish)) || []; } catch(e){ return []; } }
function saveWishlist(w){ localStorage.setItem(LS.wish, JSON.stringify(w)); }
function isWished(id){ return getWishlist().includes(Number(id)); }
function toggleWishlist(id){ id = Number(id); let w = getWishlist(); if (w.includes(id)) w = w.filter(x=>x!==id); else w.push(id); saveWishlist(w); }

function getUser(){ try { return JSON.parse(localStorage.getItem(LS.user)); } catch(e){ return null; } }
function setUser(u){ localStorage.setItem(LS.user, JSON.stringify(u)); }
function logoutUser(){ localStorage.removeItem(LS.user); }
function isLoggedIn(){ return !!getUser(); }

function qs(name){ return new URLSearchParams(location.search).get(name); }
function $(id){ return document.getElementById(id); }

let toastTimer;
function showToast(msg){
  let el = document.getElementById('nx-toast');
  if (!el){ el = document.createElement('div'); el.id='nx-toast';
    el.style.cssText='position:fixed;top:18px;left:50%;transform:translateX(-50%);background:#12151A;color:#fff;padding:12px 22px;border-radius:999px;font-weight:700;font-size:13.5px;z-index:9999;box-shadow:0 12px 30px rgba(11,31,63,0.3);opacity:0;transition:opacity .2s;';
    document.body.appendChild(el);
  }
  el.textContent = msg; el.style.opacity = '1';
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>{ el.style.opacity='0'; }, 1800);
}

function ph(catIndex, label, extraStyle, imgUrl){
  const color = CAT_COLOR[catIndex] ?? '#0B1F3F';
  const icon = CAT_ICON[catIndex] ?? '🛍️';
  const gradient = `linear-gradient(135deg, ${color}, ${shade(color)})`;
  // Layer a real photo over the branded gradient. If imgUrl 404s/fails to load, the browser
  // simply doesn't paint that layer and the gradient+icon fallback shows through underneath —
  // no JS/onerror handling needed, and nothing ever looks like a broken image.
  const bg = imgUrl ? `background-image:url('${imgUrl}'), ${gradient};background-size:cover;background-position:center;` : `background:${gradient};`;
  const content = imgUrl ? '' : `<span><span style="font-size:26px;display:block;margin-bottom:6px;">${icon}</span>${escapeHtml(label||'')}</span>`;
  return `<div class="ph" style="${bg}${extraStyle||''}">${content}</div>`;
}
function shade(hex){
  // return a slightly darker shade for gradient
  const n = parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.max(0,r-40); g=Math.max(0,g-40); b=Math.max(0,b-40);
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function starBar(rating){ const full = Math.round(rating); return '★★★★★'.slice(0,full) + '☆☆☆☆☆'.slice(0, 5-full); }

/* ---------- header / footer ---------- */
function renderHeader(active){
  const c = tc(); const ar = isAr();
  const catsHtml = CATS.map((cat,i) => {
    const name = ar ? cat.ar : cat.en;
    return `<a href="shop.html?cat=${i}"><span class="catchip"><span class="catmono" style="background:${cat.tint};color:${cat.ink};">${catMono(cat.en)}</span>${name}</span><span style="color:#B9B3A4;">›</span></a>`;
  }).join('');
  const navKeys = ['home','shop','deals','brands','about'];
  const navHrefs = ['index.html','shop.html','deals.html','brands.html','about.html'];
  const navHtml = navKeys.map((k,i) => `<a class="navitem ${active===k?'active':''}" href="${navHrefs[i]}">${c.nav[k]}</a>`).join('');
  return `
  <div class="topbar">
    <div class="langsw">
      <span id="lang-en" class="${!ar?'on':''}">English</span>
      <span id="lang-ar" class="${ar?'on':''}">العربية</span>
    </div>
    <div style="color:#8FD3A8;font-weight:600;">${c.freeShip}</div>
    <div style="display:flex;gap:18px;align-items:center;">
      <a href="help.html">${c.helpLabel}</a>
      <a href="track-order.html">${c.trackLabel}</a>
      <a href="account.html">${c.accountLabel}</a>
      ${tenantSwitcherHtml()}
    </div>
  </div>
  <header class="site">
    <a class="logo brand-wordmark" href="index.html" style="font-size:26px;font-weight:${TENANT.theme.vars['font-display-weight']};color:var(--navy);">${TENANT.name}</a>
    <form class="searchbar" onsubmit="event.preventDefault(); location.href='shop.html?q='+encodeURIComponent(this.q.value);">
      <input name="q" placeholder="${c.searchPh}">
      <button type="submit">${c.searchBtn}</button>
    </form>
    <div class="hdr-actions">
      <a class="hdr-link" href="${isLoggedIn() ? 'account.html' : 'login.html'}">
        <span class="avatar">${isLoggedIn() ? (getUser().name||'A')[0] : 'S'}</span>
        <span class="hdr-sub"><span class="lbl">${c.accountLabel}</span><br><span class="val">${isLoggedIn() ? (getUser().name||'').split(' ')[0] : c.signIn}</span></span>
      </a>
      <a class="hdr-link" href="wishlist.html"><span style="font-size:17px;">♡</span><span class="hdr-sub"><span class="lbl">${c.wishlistLabel}</span><br><span class="val">${c.saved}</span></span></a>
      <a class="cartlink" href="cart.html"><span style="font-size:13px;font-weight:700;">${c.cartLabel}</span><span class="cartcount" id="cart-count">${cartCount()}</span></a>
    </div>
  </header>
  <nav class="site">
    <button class="catbtn" id="cats-toggle">☰&nbsp; ${c.allCats}</button>
    ${navHtml}
    <span class="tagline">${c.tagline}</span>
    <div class="catsmenu" id="cats-menu">${catsHtml}</div>
  </nav>`;
}

function renderFooter(){
  const f = t('footer'); const ar = isAr();
  const colsHtml = f.cols.map(col => `
    <div><h4>${col.t}</h4>${col.l.map(l => `<a href="${l[1]}">${l[0]}</a>`).join('')}</div>`).join('');
  return `
  <div class="foot-grid">
    <div>
      <div class="brand-wordmark" style="font-size:26px;font-weight:${TENANT.theme.vars['font-display-weight']};color:#fff;margin-bottom:16px;">${TENANT.name}</div>
      <p style="margin:0;font-size:13px;line-height:1.7;max-width:260px;">${f.blurb}</p>
      <div style="display:flex;gap:10px;margin-top:18px;">
        ${['f','X','ig','yt'].map(s=>`<span style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;">${s}</span>`).join('')}
      </div>
    </div>
    ${colsHtml}
    <div>
      <h4>${f.newsletter}</h4>
      <p style="margin:0 0 14px;font-size:13px;line-height:1.7;">${f.newsSub}</p>
      <form style="display:flex;background:rgba(255,255,255,0.08);border-radius:999px;padding:4px;padding-inline-start:18px;align-items:center;gap:8px;" onsubmit="event.preventDefault(); showToast('${isAr()?'تم الاشتراك ✓':'Subscribed ✓'}'); this.reset();">
        <input required type="email" placeholder="${f.emailPh}" style="flex:1;min-width:0;border:none;outline:none;background:transparent;color:#fff;font-size:13px;">
        <button style="background:#1E5FD6;color:#fff;border:none;border-radius:999px;width:36px;height:36px;font-size:15px;cursor:pointer;flex-shrink:0;">${ar?'←':'→'}</button>
      </form>
    </div>
  </div>
  <div class="foot-bottom">
    <span>${f.copyright}</span>
    <div style="display:flex;gap:20px;"><a href="#">${f.privacy}</a><a href="#">${f.terms}</a></div>
    <div class="foot-pay"><span>VISA</span><span>MC</span><span>PayPal</span><span>CFA</span></div>
  </div>`;
}

function mountChrome(active){
  applyTenantTheme();
  document.documentElement.setAttribute('dir', isAr() ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', getLang());
  const h = document.getElementById('site-header'); if (h) h.innerHTML = renderHeader(active);
  const f = document.getElementById('site-footer'); if (f) f.innerHTML = renderFooter();
  const enBtn = document.getElementById('lang-en'); if (enBtn) enBtn.onclick = () => setLang('en');
  const arBtn = document.getElementById('lang-ar'); if (arBtn) arBtn.onclick = () => setLang('ar');
  const toggle = document.getElementById('cats-toggle'); const menu = document.getElementById('cats-menu');
  if (toggle && menu){ toggle.onclick = (e) => { e.stopPropagation(); menu.classList.toggle('open'); };
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && e.target !== toggle) menu.classList.remove('open'); }); }
  const tnTrigger = document.getElementById('tn-trigger'); const tnMenu = document.getElementById('tn-menu');
  if (tnTrigger && tnMenu){ tnTrigger.onclick = (e) => { e.stopPropagation(); tnMenu.classList.toggle('open'); };
    document.addEventListener('click', (e) => { if (!tnMenu.contains(e.target) && e.target !== tnTrigger) tnMenu.classList.remove('open'); }); }
}

/* product card builder — used across home/shop/deals/wishlist/product */
function productCard(p, opts){
  opts = opts || {};
  const ar = isAr(); const name = ar ? p.ar : p.en;
  const priceFmt = fmt(p.price); const oldFmt = p.old ? fmt(p.old) : null;
  const badge = p.badge ? `<span class="badge ${p.badge==='NEW'?'badge-blue':'badge-red'}">${ar && p.badge==='NEW' ? 'جديد' : p.badge}</span>` : '';
  const wished = isWished(p.id);
  const wishMsg = ar ? 'تم التحديث' : 'Updated';
  const wishBtn = opts.wish ? `<button class="wishbtn ${wished?'active':''}" onclick="event.preventDefault();toggleWishlist(${p.id});this.classList.toggle('active');showToast('${wishMsg}');">♥</button>` : '';
  const soldBar = (opts.showSold && p.sold) ? `<div style="height:6px;background:#F1EEE7;border-radius:999px;overflow:hidden;margin-top:2px;"><span style="display:block;height:100%;width:${p.sold}%;background:linear-gradient(90deg,#B03A2E,#E07856);border-radius:999px;"></span></div><div style="font-size:11px;color:#8A857A;font-weight:600;">${p.sold}% ${t('deals').sold}</div>` : '';
  return `<div class="card pcard">
    ${badge}${wishBtn}
    <a href="product.html?id=${p.id}" class="pimg">${ph(p.cat, name, '', p.img)}</a>
    <div style="display:flex;flex-direction:column;gap:6px;padding:2px 4px 4px;">
      <a href="product.html?id=${p.id}" class="pname">${name}</a>
      <div class="prating"><span style="color:#C89B3C;">★</span> ${p.rating} · ${p.reviews} ${t('reviews')}</div>
      ${soldBar}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px;">
        <div><div class="pprice">${priceFmt}</div>${oldFmt?`<div class="pold">${oldFmt}</div>`:''}</div>
        <button class="addbtn" onclick="addToCart(${p.id});">+</button>
      </div>
    </div>
  </div>`;
}
