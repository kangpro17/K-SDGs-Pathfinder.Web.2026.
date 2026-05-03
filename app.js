/* K-SDGs Reader - Main Application */
(function(){
'use strict';
const D = window.DATA;
const SDG_COLORS = ['','#E5243B','#DDA63A','#4C9F38','#C5192D','#FF3A21','#26BDE2','#FCC30B','#A21942','#FD6925','#DD1367','#FD9D24','#BF8B2E','#3F7E44','#0A97D9','#56C02B','#00689D','#19486A'];
const SUBJ_MAP = {
  '과학':{en:'SCIENCE',cls:'science',color:'#185FA5',bg:'#E6F1FB',deep:'#042C53',abbr:'SCI'},
  '도덕':{en:'MORAL',cls:'moral',color:'#3C3489',bg:'#ECEAF6',deep:'#26215C',abbr:'MOR'},
  '기술가정':{en:'TECH·HOME',cls:'tech',color:'#0F6E56',bg:'#E2F2EC',deep:'#085041',abbr:'T·H'},
  '사회':{en:'SOCIAL',cls:'social',color:'#854F0B',bg:'#F4EADC',deep:'#633806',abbr:'SOC'}
};
const SUBJ_ORDER = ['과학','도덕','기술가정','사회'];

function navSVG(){return '<svg viewBox="-12 -12 24 24"><circle cx="0" cy="-8" r="2.5" fill="#E5243B"/><circle cx="6.93" cy="-4" r="2.5" fill="#FCC30B"/><circle cx="6.93" cy="4" r="2.5" fill="#3F7E44"/><circle cx="0" cy="8" r="2.5" fill="#0A97D9"/><circle cx="-6.93" cy="4" r="2.5" fill="#56C02B"/><circle cx="-6.93" cy="-4" r="2.5" fill="#DD1367"/></svg>';}

function nav(type, active){
  const cls = type==='dark'?'nav-dark':type==='archive'?'nav-archive':'nav-light';
  const ab = active==='subject'?'교과':'';
  return `<nav class="${cls}"><a href="#/" class="nav-logo">${navSVG()}<span class="brand">K · SDGS READER</span></a><div class="nav-menu"><a href="#/subject/과학"${active==='subject'?' class="active"':''}>교과 · 성취기준</a><a href="#/ksdgs"${active==='ksdgs'?' class="active"':''}>K-SDGs 색인</a><a href="#/howto"${active==='howto'?' class="active"':''}>사용법</a><a href="#/search" class="nav-search${active==='search'?' active':''}">⌕ 검색</a></div></nav>`;
}

function footer(type){
  const cls = type==='dark'?'footer-dark':type==='archive'?'footer-archive':'footer-light';
  return `<footer class="${cls}"><div>© 2026 K-SDGs Reader · 석사학위 연구 자료집</div><div${type==='dark'?' class="right"':''}>도서 출처 · SDG Book Club Korea · 학교도서관ing · 대구대표도서관 · 독서로</div></footer>`;
}

function breadcrumb(type, items){
  const cls = type==='archive'?'breadcrumb-archive':'breadcrumb';
  return `<div class="${cls}">${items.map((it,i)=>i<items.length-1?`<a href="${it.href||'#/'}">${it.text}</a><span class="sep">›</span>`:`<span class="current">${it.text}</span>`).join('')}</div>`;
}

function sdgBg(n){return `background:${SDG_COLORS[n]}`;}
function subjInfo(s){return SUBJ_MAP[s]||SUBJ_MAP['과학'];}

/* helper: find book by slug */
function findBook(slug){return D.books.find(b=>b.slug===slug);}
function findStd(code){return D.standards.find(s=>s.code===code);}
function findSDG(num){return D.ksdgs.find(k=>k.num===parseInt(num));}

/* helper: get related books (same SDG) */
function relatedBooks(book, max){
  const goals = book.ksdgs_goals||[];
  if(!goals.length) return [];
  return D.books.filter(b=>b.slug!==book.slug && b.ksdgs_goals.some(g=>goals.includes(g))).slice(0,max||3);
}

/* helper: standards sorted by code for a subject */
function stdsBySubject(subj){
  return D.standards.filter(s=>s.subject===subj).sort((a,b)=>a.code.localeCompare(b.code));
}

/* helper: which SDGs does a subject use? */
function subjectSDGs(subj){
  const stds = stdsBySubject(subj);
  const set = new Set();
  stds.forEach(s=>(s.ksdgs_goals||[]).forEach(g=>set.add(g)));
  return set;
}

/* helper: count books for subject */
function subjectBookCount(subj){
  const stds = stdsBySubject(subj);
  const books = new Set();
  stds.forEach(s=>(s.books||[]).forEach(b=>books.add(b)));
  return books.size;
}

/* helper: subject description */
function subjectDesc(subj){
  const descs = {
    '과학':'2022 개정 교육과정 중학교 과학과 성취기준이 생물다양성·기후변화·재해재난·과학직업 등의 주제로 K-SDGs 목표와 연결됩니다. 과학 탐구의 결과를 사회적 실천으로 잇는 독서 자료를 찾아보세요.',
    '도덕':'2022 개정 교육과정 중학교 도덕과 성취기준이 인권·평화·정의·성평등 등의 주제로 K-SDGs 목표와 연결됩니다. 도덕적 판단력을 키우는 독서 활동을 설계해 보세요.',
    '기술가정':'2022 개정 교육과정 중학교 기술·가정과 성취기준이 에너지·환경·건강·성인지 감수성 등의 주제로 K-SDGs 목표와 연결됩니다. 실생활과 연결된 독서 수업을 준비해 보세요.',
    '사회':'2022 개정 교육과정 중학교 사회과 성취기준이 기후변화·인권·민주주의·세계시민 등의 주제로 K-SDGs 목표와 연결됩니다. 사회 현상에 대한 이해를 심화하는 독서 자료를 활용해 보세요.'
  };
  return descs[subj]||'';
}

/* helper: badges for standards */
function stdBadges(std, allStds){
  const badges = [];
  const maxBooks = Math.max(...allStds.map(s=>s.book_count));
  if(std.book_count===maxBooks && maxBooks>1) badges.push({text:'도서 최다',bg:'var(--c-orange)'});
  if((std.ksdgs_goals||[]).length>=3) badges.push({text:'교차 SDG',bg:SDG_COLORS[(std.ksdgs_goals||[])[0]]||'var(--c-orange)'});
  return badges;
}

/* helper: SDG detail background colors */
function sdgDetailBg(goalNum){
  const map={1:'#FBE9EC',2:'#FFF6E1',3:'#E5F2DF',4:'#FBE9E9',5:'#FFE9E5',6:'#E1F4FB',7:'#FFF8E0',8:'#F5E6EC',9:'#FFF0E5',10:'#FAE5EF',11:'#FEF3E2',12:'#F5EDD8',13:'#E5F2DF',14:'#E1F1FB',15:'#EAF3DE',16:'#E1EFF8',17:'#E8ECF0'};
  return map[goalNum]||'#F0F0F0';
}
function sdgDetailColor(goalNum){
  const map={1:'#4A1116',2:'#412402',3:'#173404',4:'#4D1313',5:'#A32D2D',6:'#053D5C',7:'#5C3B00',8:'#4A1126',9:'#5C2A08',10:'#5C0A2A',11:'#5C390B',12:'#3A2A08',13:'#1A3A1F',14:'#042438',15:'#173404',16:'#042438',17:'#0A1628'};
  return map[goalNum]||'#333';
}

/* ============ ROUTER ============ */
function route(){
  const hash = location.hash||'#/';
  const parts = hash.replace('#/','').split('?');
  const path = parts[0];
  const query = parts[1]?Object.fromEntries(new URLSearchParams(parts[1])):{};
  const segs = path.split('/').filter(Boolean);

  if(!segs.length) return renderHome();
  if(segs[0]==='subject'&&segs[1]) return renderSubject(decodeURIComponent(segs[1]));
  if(segs[0]==='ksdgs'&&segs[1]) return renderKsdgsDetail(segs[1]);
  if(segs[0]==='ksdgs') return renderKsdgs();
  if(segs[0]==='search') return renderSearch(query.q||'');
  if(segs[0]==='standard'&&segs[1]) return renderStandard(decodeURIComponent(segs[1]));
  if(segs[0]==='book'&&segs[1]) return renderBook(decodeURIComponent(segs.slice(1).join('/')));
  if(segs[0]==='howto') return renderHowto();
  renderHome();
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);

/* Navigate helper */
function go(hash){location.hash=hash;}
window.go = go;
function scrollTop(){window.scrollTo(0,0);}

/* ============ RENDER: HOME ============ */
function renderHome(){
  scrollTop();
  const m = D.meta;
  const subjs = SUBJ_ORDER.map(name=>{
    const info = subjInfo(name);
    const s = m.subjects[name];
    const stds = stdsBySubject(name);
    const firstCodes = stds.slice(0,2).map(st=>st.code);
    const more = stds.length - firstCodes.length;
    return {name,info,s,firstCodes,more};
  });

  document.getElementById('app').innerHTML = `
<div class="page-home">
${nav('archive','home')}
<section class="hero"><div class="container">
<div class="hero-eyebrow">2022 개정 교육과정 · 중학교 · 학교도서관 활용수업</div>
<h1>성취기준에서<br/><span class="gold">시작하세요.</span></h1>
<p class="lead">지금 준비 중인 수업의 성취기준을 누르면, 연결된 K-SDGs와 <span class="num">${m.total_books}권</span>의 도서가 열립니다. 주제가 아니라 <strong>수업에서부터</strong> 출발하는 SDGs 독서 지도.</p>
<div class="search-bar-home"><span class="icon">⌕</span><input type="text" id="home-search" placeholder="성취기준 코드 또는 키워드 · 예) 9과17-01, 기후변화, 인권" /><button onclick="doHomeSearch()">검색</button></div>
</div></section>

<section class="subjects-section"><div class="container">
<div class="subjects-head"><h2>교과에서 시작하기 <span class="badge">· 권장 경로</span></h2><span class="meta">4개 교과 · ${m.total_standards}개 성취기준 · ${m.total_books}권</span></div>
<div class="subjects-grid">
${subjs.map(sb=>`<a href="#/subject/${sb.name}" class="subject-card ${sb.info.cls}">
<div class="label">${sb.info.en}</div><div class="name">${sb.name==='기술가정'?'기술·가정':sb.name}</div>
<div class="stats"><div><div class="stat-num">${sb.s.std_count}</div><div class="stat-label">성취기준</div></div><div><div class="stat-num">${sb.s.book_count}</div><div class="stat-label">도서</div></div></div>
<div class="codes">${sb.firstCodes.map(c=>`<span class="pill">${c}</span>`).join('')}${sb.more>0?`<span class="more">+${sb.more}</span>`:''}</div>
</a>`).join('')}
</div></div></section>

<section class="stats-strip"><div class="container"><div class="stats-grid">
<div class="stat-item"><div class="big">${m.total_standards}</div><div class="key">STANDARDS</div><div class="desc">중학교 성취기준</div></div>
<div class="stat-item"><div class="big">${m.total_books}</div><div class="key">BOOKS</div><div class="desc">중학생 권장 도서</div></div>
<div class="stat-item"><div class="big">${m.total_lessons}</div><div class="key">LESSONS</div><div class="desc">성취기준 × 도서 활용 방안</div></div>
</div></div></section>

<section class="alternate-section"><div class="container"><div class="alt-grid">
<div class="compass-wrap">
<svg class="compass" viewBox="-60 -60 120 120" role="img" aria-label="K-SDGs 17 회오리">
<circle cx="0" cy="0" r="46" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.4" stroke-dasharray="1,3"/>
${D.ksdgs.map((k,i)=>{const a=(i/17)*Math.PI*2-Math.PI/2;const x=Math.round(46*Math.cos(a)*10)/10;const y=Math.round(46*Math.sin(a)*10)/10;return `<circle cx="${x}" cy="${y}" r="5" fill="${SDG_COLORS[k.num]}"${k.used?'':' opacity="0.18"'}/>`}).join('\n')}
</svg></div>
<div class="alt-text">
<div class="alt-eyebrow">ALTERNATE PATH · 보조 탐색</div>
<h3>K-SDGs 목표에서 거꾸로 찾기</h3>
<p><span class="quote">"기후변화 수업을 하고 싶은데 어떤 성취기준과 도서가 있을까?"</span> — 17개 K-SDGs 목표에서 출발해 관련 성취기준·도서로 역으로 찾아갈 수 있어요. 성취기준 중심 탐색을 보완하는 대안 경로입니다.</p>
<a href="#/ksdgs" class="alt-cta">K-SDGs 색인 열기 <span>→</span></a>
</div></div></div></section>

<section class="howto-section"><div class="container">
<h2>연구 흐름대로, 3단계로 쓰세요</h2>
<div class="howto-grid">
<div class="howto-step"><div class="num">01 <span class="sub">교사가 여는 곳</span></div><h4>성취기준을 고릅니다</h4><p>이번 주 수업에서 다룰 교과와 성취기준을 선택합니다.</p></div>
<div class="howto-arrow">→</div>
<div class="howto-step"><div class="num">02 <span class="sub">자동으로 연결</span></div><h4>연결된 K-SDGs가 보입니다</h4><p>성취기준과 매핑된 K-SDGs 목표·세부목표를 확인합니다.</p></div>
<div class="howto-arrow">→</div>
<div class="howto-step"><div class="num">03 <span class="sub">수업에 씁니다</span></div><h4>도서와 활용 방안을 엽니다</h4><p>연결된 도서의 해제, 수업활용, 독서로 링크까지 한 페이지에.</p></div>
</div></div></section>
${footer('archive')}
</div>`;
  document.getElementById('home-search').addEventListener('keydown',function(e){if(e.key==='Enter')doHomeSearch();});
}

function doHomeSearch(){
  const q = document.getElementById('home-search').value.trim();
  if(q) go('#/search/'+encodeURIComponent(q));
}
window.doHomeSearch = doHomeSearch;

function renderSubject(subj, sortBy, filterSDG){
  scrollTop();
  sortBy = sortBy||'code';
  filterSDG = filterSDG||null;
  const si = subjInfo(subj);
  let stds = stdsBySubject(subj);
  const usedSDGs = subjectSDGs(subj);
  const allStds = stds;
  const bookCount = D.meta.subjects[subj]?D.meta.subjects[subj].book_count:0;
  const idx = SUBJ_ORDER.indexOf(subj);

  /* Apply SDG filter */
  if(filterSDG){
    stds = stds.filter(s=>(s.ksdgs_goals||[]).includes(filterSDG));
  }
  /* Apply sort */
  if(sortBy==='book'){
    stds = stds.slice().sort((a,b)=>b.book_count-a.book_count);
  }
  const sortLabel = sortBy==='book'?'도서 많은 순':'코드순';
  const filterLabel = filterSDG?` · K-SDGs ${filterSDG} 필터`:'';

  document.getElementById('app').innerHTML = `
<div class="page-subject">
${nav('light','subject')}
${breadcrumb('light',[{text:'홈',href:'#/'},{text:'교과 · 성취기준'},{text:subj}])}
<div class="subject-tabs">
${SUBJ_ORDER.map((s,i)=>{const si2=subjInfo(s);return `<button class="subject-tab${s===subj?' active':''}" onclick="go('#/subject/${s}')" style="${s===subj?'color:'+si2.color:''}">${s==='기술가정'?'기술·가정':s}<span class="count">${D.meta.subjects[s].std_count}</span></button>`}).join('')}
</div>
<section class="cover-section" style="--subj-color:${si.color}">
<div style="position:absolute;top:0;right:-120px;bottom:0;width:480px;background:radial-gradient(circle,${si.color}11 0%,transparent 60%);pointer-events:none"></div>
<div class="cover-grid">
<div>
<div class="cover-eyebrow" style="color:${si.color}"><span class="num">SUBJECT / 0${idx+1}</span>· ${si.en}</div>
<h1 class="cover-title" style="color:${si.color}">${subj==='기술가정'?'기술·가정':subj}</h1>
<p class="cover-desc">${subjectDesc(subj)}</p>
</div>
<div class="cover-stats">
<div class="stat-item"><div class="num" style="color:${si.color}">${allStds.length}</div><div class="lbl">STANDARDS</div></div>
<div class="stat-item"><div class="num" style="color:${si.color}">${bookCount}</div><div class="lbl">BOOKS</div></div>
</div></div></section>

<main class="main-layout"><aside class="sidebar">
<div class="side-section"><div class="side-title">K-SDGs 필터</div>
<div class="sdg-mini-grid" id="sdg-filter-grid">${Array.from({length:17},(_, i)=>{const n=i+1;const used=usedSDGs.has(n);return `<div class="sdg-mini${!used?' dim':''}${filterSDG===n?' selected-sdg':''}" style="${sdgBg(n)}${filterSDG===n?';outline:2px solid var(--c-ink-1a);outline-offset:1px':''}" data-sdg="${n}" data-used="${used}" title="K-SDGs ${n}">${n}</div>`}).join('')}
</div>
<div style="font-size:10.5px;color:var(--c-ink-faint2);margin-top:10px;line-height:1.5">${subj==='기술가정'?'기술·가정':subj}과는 <strong style="color:var(--c-ink-meta2)">${usedSDGs.size}개 SDG</strong>를 다룹니다.${filterSDG?' <a style="color:var(--c-orange);cursor:pointer" id="clear-sdg-filter">필터 해제</a>':' 흐린 칸은 이 교과가 다루지 않는 SDG입니다.'}</div>
</div>
<div class="side-section"><div class="side-title">정렬</div>
<div class="sort-options">
<button class="sort-option${sortBy==='code'?' selected':''}" id="sort-code"><span class="dot" style="${sortBy==='code'?'background:'+si.color+';border-color:'+si.color:''}"></span> 성취기준 코드순</button>
<button class="sort-option${sortBy==='book'?' selected':''}" id="sort-book"><span class="dot" style="${sortBy==='book'?'background:'+si.color+';border-color:'+si.color:''}"></span> 수록 도서 많은 순</button>
</div></div>
<div class="side-section"><div class="side-title">학년 필터</div><div class="filter-disabled">PHASE5 데이터에 학년 정보 미수록 (개발 보류)</div></div>
</aside>

<section>
<div class="list-meta"><div class="total">성취기준 <strong>${stds.length}</strong>건${filterSDG?' (필터 적용)':''} · 도서 <strong>${bookCount}</strong>권 · 정렬: ${sortLabel}${filterLabel}</div></div>
<div class="std-list" id="std-list-content">
${stds.map((st,i)=>{
  const badges = stdBadges(st, allStds);
  return `<a href="#/standard/${st.code}" class="std-row">
<div class="std-num">${String(i+1).padStart(2,'0')}</div>
<div class="std-meta-col">
<span class="std-code-pill" style="background:${si.bg};color:${si.deep}">${st.code}</span>
<span class="std-book-count"><span class="strong">${st.book_count}</span>권</span>
${badges.map(b=>`<span class="std-badge" style="background:${b.bg}">${b.text}</span>`).join('')}
</div>
<div class="std-text-col">
<p class="std-text">${st.text}</p>
<div class="std-sdgs">${(st.ksdgs_goals||[]).map(g=>`<span class="sdg-badge-mini" style="background:${sdgDetailBg(g)};color:${sdgDetailColor(g)}"><span class="dot" style="${sdgBg(g)}">${g}</span>K-SDGs ${g}${(st.sdgs||[]).filter(s=>parseInt(s)===g).length>1?' · '+((st.sdgs||[]).filter(s=>parseInt(s)===g).length)+'개 세부목표':''}</span>`).join('')}</div>
</div>
<div class="std-arrow" style="color:${si.color}">→</div>
</a>`}).join('')}
</div>

<div class="summary-box" style="background:${si.bg};border-left:3px solid ${si.color}">
<h4 style="color:${si.color}">${si.en} · 분포 요약</h4>
<p>${subj==='기술가정'?'기술·가정':subj}과 ${allStds.length}개 성취기준 중 도서가 가장 많이 연결된 성취기준과 교차 SDG 성취기준을 중심으로 수업을 설계해 보세요.</p>
</div>
</section></main>
${footer('light')}
</div>`;

  /* Sort handlers */
  const _subj = subj, _fSDG = filterSDG;
  document.getElementById('sort-code').addEventListener('click',function(){ renderSubject(_subj,'code',_fSDG); });
  document.getElementById('sort-book').addEventListener('click',function(){ renderSubject(_subj,'book',_fSDG); });
  /* SDG filter handlers */
  document.querySelectorAll('#sdg-filter-grid .sdg-mini').forEach(el=>{
    el.addEventListener('click',function(){
      if(this.dataset.used==='false') return;
      const n = parseInt(this.dataset.sdg);
      renderSubject(_subj, sortBy, _fSDG===n?null:n);
    });
  });
  const clearBtn = document.getElementById('clear-sdg-filter');
  if(clearBtn) clearBtn.addEventListener('click',function(){ renderSubject(_subj, sortBy, null); });
}


/* ============ RENDER: K-SDGs ============ */
function renderKsdgs(){
  scrollTop();
  const first = D.ksdgs.find(k=>k.used);
  if(first) return renderKsdgsDetail(first.num);
}

function renderKsdgsDetail(num){
  scrollTop();
  num = parseInt(num);
  const sdg = findSDG(num);
  if(!sdg||!sdg.used) return renderKsdgsPage(num, null);
  renderKsdgsPage(num, sdg);
}

function renderKsdgsPage(selectedNum, sdg){
  const color = SDG_COLORS[selectedNum]||'#333';
  document.getElementById('app').innerHTML = `
<div class="page-ksdgs">
${nav('light','ksdgs')}
${breadcrumb('light',[{text:'홈',href:'#/'},{text:'K-SDGs 색인'}])}
<header class="page-header-ksdgs">
<div class="page-eyebrow">K-SDGS · ALTERNATE PATH</div>
<h1 class="page-title">K-SDGs 목표에서<br/>거꾸로 찾기</h1>
<p class="page-desc"><strong>"기후변화 수업을 하고 싶은데 어떤 성취기준과 도서가 있을까?"</strong> — 17개 K-SDGs 목표에서 출발해 관련 성취기준·도서로 역으로 찾아갑니다. <strong>9·17번 목표</strong>는 본 정보길잡이의 4교과 37개 성취기준에서 직접 다루지 않으므로 비활성화되어 있습니다.</p>
</header>
<section class="sdg-grid-section">
<div class="sdg-grid-head"><h3>SDG 17 · 6 × 3 GRID</h3><span class="meta">15개 사용 · 2개 미사용 (9, 17)</span></div>
<div class="sdg-grid">
${D.ksdgs.map(k=>{
  const sel = k.num===selectedNum&&k.used;
  if(!k.used) return `<span class="sdg-block disabled" style="${sdgBg(k.num)}"><span class="num">${String(k.num).padStart(2,'0')}</span><div><div class="nm">${k.name}</div><div class="ct">미연결</div></div></span>`;
  return `<a href="#/ksdgs/${k.num}" class="sdg-block${sel?' selected':''}" style="${sdgBg(k.num)}"><span class="num">${String(k.num).padStart(2,'0')}</span><div><div class="nm">${k.name}</div><div class="ct">${k.book_count}권 · ${(k.standards||[]).length} STD</div></div></a>`;
}).join('')}
</div></section>

${sdg?renderKsdgsSelected(sdg):''}
${footer('light')}
</div>`;
}

function renderKsdgsSelected(sdg){
  const color = SDG_COLORS[sdg.num];
  const connStds = (sdg.standards||[]).map(c=>findStd(c)).filter(Boolean);
  const bySubject = {};
  SUBJ_ORDER.forEach(s=>bySubject[s]=[]);
  connStds.forEach(st=>{if(bySubject[st.subject])bySubject[st.subject].push(st);});
  const connBooks = D.books.filter(b=>(b.ksdgs_goals||[]).includes(sdg.num));

  return `
<section class="selected-section" style="background:linear-gradient(180deg,${color}0F 0%,${color}05 100%);border-top:3px solid ${color}">
<div class="selected-inner"><div class="selected-grid">
<div class="big-tile" style="background:${color}">
<div class="num-big">${sdg.num}</div><div class="name-big">${sdg.name}</div>
<p class="desc-big">${sdg.details&&sdg.details[0]?sdg.details[0].text.substring(0,80)+'…':'K-SDGs '+sdg.num+'번 목표'}</p>
<div class="stats-row">
<div class="stat"><div class="v">${(sdg.details||[]).length}</div><div class="l">SUB-TARGETS</div></div>
<div class="stat"><div class="v">${connStds.length}</div><div class="l">STANDARDS</div></div>
<div class="stat"><div class="v">${sdg.book_count}</div><div class="l">BOOKS</div></div>
</div></div>
<div>
<div class="detail-targets"><h3>세부목표 · ${(sdg.details||[]).length}개</h3>
<div class="detail-grid">${(sdg.details||[]).map(d=>`<div class="detail-target"><span class="code" style="color:${color};background:${color}1A">${d.code}</span><p class="text">${d.text}</p></div>`).join('')}</div></div>
<div class="subject-quad"><h3>연결 성취기준 · 교과별<span class="hint">${SUBJ_ORDER.map(s=>bySubject[s].length>0?`${s==='기술가정'?'기술가정':s} ${bySubject[s].length}`:null).filter(Boolean).join(' · ')}</span></h3>
<div class="quad-grid">
${SUBJ_ORDER.map(s=>{const si=subjInfo(s);const sts=bySubject[s];return `<div class="quad-card ${si.cls}"><div class="subj-label">${si.en}</div><div class="subj-name">${s==='기술가정'?'기술·가정':s}과 · ${sts.length}개</div>${sts.length?`<div class="std-link-row">${sts.map(st=>`<a href="#/standard/${st.code}" class="quad-std-link"><div class="lhs"><span class="code-mini" style="color:${si.color}">${st.code}</span><span class="short">${st.text.substring(0,12)}…</span></div><span class="book-ct">${st.book_count}권</span></a>`).join('')}</div>`:`<p class="empty-msg">${s==='기술가정'?'기술·가정':s}과는 K-SDGs ${sdg.num}에 직접 연결된 성취기준이 없습니다.</p>`}</div>`}).join('')}
</div></div>
</div></div></div></section>

<section class="books-section"><div class="books-inner">
<div class="books-head"><h2>K-SDGs ${sdg.num} 연결 도서 · ${connBooks.length}권</h2><span class="meta">교과 구분 없이 모아보기 · 융합 수업 준비에 적합</span></div>
<div class="books-grid">
${connBooks.map((b,i)=>{
  return `<a href="#/book/${b.slug}" class="book-card" style="--hover-color:${color}">
<div class="cover-mini"></div><div class="info">
<div class="num-tag">${String(i+1).padStart(3,'0')}</div>
<h4>${b.title}</h4>
<div class="byline">${b.author} · ${b.publisher} · ${b.year}</div>
<div class="subj-tags">${(b.subjects||[]).map(s=>{const si=subjInfo(s);return `<span class="subj-tag-mini ${si.cls}">${si.abbr}</span>`}).join('')}</div>
</div></a>`}).join('')}
</div></div></section>`;
}

/* ============ RENDER: SEARCH ============ */
function renderSearch(q){
  scrollTop();
  const results = q ? doSearch(q) : {standards:[],books:[],ksdgs:[]};
  const total = results.standards.length + results.books.length + results.ksdgs.length;
  const hl = q ? (t => t.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>')) : (t=>t);

  document.getElementById('app').innerHTML = `
<div class="page-search">
${nav('light','search')}
${breadcrumb('light',[{text:'홈',href:'#/'},{text:'검색'}])}
<header class="search-header"><div class="search-header-inner">
<div class="search-eyebrow">SEARCH · 통합 검색</div>
<div class="search-bar"><span class="icon">⌕</span><input type="text" id="search-input" value="${q}" placeholder="성취기준 코드 · 도서 제목 · K-SDGs 키워드" /><button onclick="doSearchAction()">검색</button></div>
<div class="suggestions"><span class="lbl">추천 검색어</span>
<a class="sug-pill code" onclick="setSearch('9과17-01')">9과17-01</a>
<a class="sug-pill" onclick="setSearch('기후변화')">기후변화</a>
<a class="sug-pill" onclick="setSearch('인권')">인권</a>
<a class="sug-pill" onclick="setSearch('SDG 13')">SDG 13 <span class="hint">기후</span></a>
<a class="sug-pill" onclick="setSearch('생물다양성')">생물다양성</a>
</div>
</div></header>
${q?`<div class="result-meta">
<div class="result-count"><span class="query">${q}</span> 검색 결과 <strong>${total}</strong>건 · 성취기준 ${results.standards.length} · 도서 ${results.books.length} · K-SDGs ${results.ksdgs.length}</div>
</div>
<div class="results">
${results.standards.length?`<div class="result-section"><div class="section-head"><span class="marker blue"></span><h2>성취기준</h2><span class="count">${results.standards.length}건</span></div>
${results.standards.map(st=>`<a href="#/standard/${st.code}" class="std-result" style="margin-bottom:10px"><div class="std-meta"><span class="std-code-pill">${hl(st.code)}</span><span class="subj-pill" style="background:${subjInfo(st.subject).bg};color:${subjInfo(st.subject).color}">${st.subject}</span></div><p class="std-text">${hl(st.text)}</p><span class="std-arrow">→</span></a>`).join('')}
</div>`:''}
${results.books.length?`<div class="result-section"><div class="section-head"><span class="marker green"></span><h2>도서</h2><span class="count">${results.books.length}건</span></div>
<div class="book-grid-search">${results.books.map(b=>{const si=subjInfo((b.subjects||[])[0]||'과학');return `<a href="#/book/${b.slug}" class="book-result"><div class="mini-cover">${(b.ksdgs_goals||[]).length?`<span class="badge" style="${sdgBg((b.ksdgs_goals||[])[0])}">${(b.ksdgs_goals||[])[0]}</span>`:''}</div><div class="info"><h4>${hl(b.title)}</h4><div class="byline">${hl(b.author)} · ${b.publisher} · ${b.year}</div><p class="review-snippet">${b.review?hl(b.review.substring(0,80))+'…':''}</p></div><div class="right-pills">${(b.standards||[]).slice(0,2).map(c=>`<span class="std-link">${c}</span>`).join('')}${(b.ksdgs_goals||[]).slice(0,1).map(g=>`<span class="sdg-link"><span class="dot" style="${sdgBg(g)}">${g}</span>K-SDGs ${g}</span>`).join('')}</div></a>`}).join('')}</div>
</div>`:''}
${results.ksdgs.length?`<div class="result-section"><div class="section-head"><span class="marker yellow"></span><h2>K-SDGs 목표</h2><span class="count">${results.ksdgs.length}건</span></div>
${results.ksdgs.map(k=>`<a href="#/ksdgs/${k.num}" class="ksdg-result" style="margin-bottom:10px"><div class="sdg-icon" style="${sdgBg(k.num)}">${k.num}</div><div class="info"><h4>${hl('K-SDGs '+k.num+' — '+k.name)}</h4><p class="desc">${k.details&&k.details[0]?hl(k.details[0].text.substring(0,80))+'…':''}</p></div><div class="meta"><div class="num">${k.book_count}</div><div class="lbl">BOOKS</div></div></a>`).join('')}
</div>`:''}
${total===0?'<div style="text-align:center;padding:60px 0;color:var(--c-ink-faint2)"><div style="font-size:28px;margin-bottom:14px">검색 결과가 없습니다</div><p style="font-size:13px;color:var(--c-ink-meta2);line-height:1.7">다른 검색어를 입력하거나, 위 추천 검색어를 눌러 보세요.<br/>성취기준 코드(예: 9과17-01) 또는 키워드(예: 기후변화)를 사용할 수 있습니다.</p></div>':''}
</div>`:'<div style="text-align:center;padding:80px 0;color:var(--c-ink-faint2)"><div style="font-size:32px;margin-bottom:14px">검색어를 입력하세요</div><p style="font-size:13px;color:var(--c-ink-meta2)">위 추천 검색어를 눌러도 됩니다.</p></div>'}
${footer('light')}
</div>`;

  const inp = document.getElementById('search-input');
  if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter')doSearchAction();});
}

function doSearch(q){
  q = q.toLowerCase().trim();
  const stds = D.standards.filter(s=>s.code.toLowerCase().includes(q)||s.text.toLowerCase().includes(q));
  const books = D.books.filter(b=>b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q)||(b.review||'').toLowerCase().includes(q)||(b.publisher||'').toLowerCase().includes(q)||(b.standards||[]).some(c=>c.toLowerCase().includes(q)));
  let ksdgs = [];
  const sdgMatch = q.match(/^(?:sdg|sdgs|k-sdgs?)\s*(\d+)/i);
  if(sdgMatch){
    const num = parseInt(sdgMatch[1]);
    const found = D.ksdgs.filter(k=>k.num===num&&k.used);
    ksdgs = found;
  } else {
    ksdgs = D.ksdgs.filter(k=>k.used&&(k.name.toLowerCase().includes(q)||(k.details||[]).some(d=>d.text.toLowerCase().includes(q))));
  }
  return {standards:stds,books:books,ksdgs:ksdgs};
}

window.doSearchAction = function(){
  const q = document.getElementById('search-input').value.trim();
  go('#/search?q='+q);
};
window.setSearch = function(q){
  go('#/search?q='+q);
};

/* ============ RENDER: STANDARD DETAIL ============ */
function renderStandard(code){
  scrollTop();
  const std = findStd(code);
  if(!std) return renderHome();
  const si = subjInfo(std.subject);
  const stds = stdsBySubject(std.subject);
  const idx = stds.findIndex(s=>s.code===code);
  const prevStd = idx>0?stds[idx-1]:null;
  const nextStd = idx<stds.length-1?stds[idx+1]:null;
  const connBooks = (std.books||[]).map(t=>D.books.find(b=>b.title===t)).filter(Boolean);
  const single = connBooks.filter(b=>b.category==='single_standard');
  const multi = connBooks.filter(b=>b.category==='multi_standard');
  const cross = connBooks.filter(b=>b.category==='cross_subject');

  const sdgCards = (std.sdgs||[]).map(code=>{
    const num = parseInt(code);
    const detail = std.sdg_details?std.sdg_details[code]:null;
    return {code:code,num:num,text:detail||'',color:SDG_COLORS[num]};
  });

  document.getElementById('app').innerHTML = `
<div class="page-standard">
${nav('archive','subject')}
${breadcrumb('archive',[{text:'홈',href:'#/'},{text:std.subject,href:'#/subject/'+std.subject},{text:std.code}])}
<div class="archive-container">
<a href="#/subject/${std.subject}" class="back-link"><span class="arrow">←</span> ${std.subject==='기술가정'?'기술·가정':std.subject}과 목록으로</a>
<header class="std-header">
<div class="std-tags">
<span class="tag-code-large">${std.code}</span>
<span class="tag-subject" style="background:${si.bg};color:${si.color}">${std.subject==='기술가정'?'기술·가정':std.subject}</span>
<span class="tag-curriculum">2022 개정 교육과정 · 중학교</span>
</div>
<blockquote class="std-quote">${std.text}</blockquote>
</header>

<section class="section-analysis">
<div class="eyebrow">ANALYSIS · 분석</div><div class="divider"></div>
<p class="analysis-text">이 성취기준은 <span class="accent">${std.subject==='기술가정'?'기술·가정':std.subject}과</span>에 속하며, ${(std.ksdgs_goals||[]).length}개의 K-SDGs 목표, ${(std.sdgs||[]).length}개의 세부목표와 연결됩니다. 총 <span class="accent">${std.book_count}권</span>의 중학생 권장 도서가 이 성취기준과 함께 활용될 수 있습니다.</p>
</section>
</div>

<section class="section-sdg-mapping"><div class="mapping-inner">
<div class="eyebrow">K-SDGs MAPPING · 연결 지도</div><div class="divider"></div>
<p class="mapping-intro"><strong>${std.code}</strong> 성취기준은 K-SDGs의 <strong>${(std.ksdgs_goals||[]).map(g=>'목표 '+g).join(', ')}</strong>과 연결됩니다. 아래 카드에서 세부목표 <span class="pill">${(std.sdgs||[]).join(', ')}</span>별 내용을 확인하세요.</p>
<div class="mapping-cards">
${sdgCards.map(sc=>`<div class="mapping-card"><div class="mapping-card-head"><div class="sdg-tile" style="${sdgBg(sc.num)}">${sc.num}</div><div class="head-info"><div class="code-line"><span class="detail-code" style="color:${sc.color};background:${sc.color}1A">${sc.code}</span></div></div></div><p class="detail-text">${sc.text}</p></div>`).join('')}
</div></div></section>

<section class="section-books"><div class="books-inner-archive">
<div class="eyebrow">BOOKS · 연결 도서</div><div class="divider"></div>
<div class="detail-filter">
<button class="filter-tab active" style="color:${si.color}" data-cat="all">전체 <span class="ct">${connBooks.length}</span></button>
${single.length?`<button class="filter-tab" data-cat="single"><span class="dot" style="background:var(--c-science)"></span>단일 <span class="ct">${single.length}</span></button>`:''}
${multi.length?`<button class="filter-tab" data-cat="multi"><span class="dot" style="background:var(--c-tech)"></span>복수 <span class="ct">${multi.length}</span></button>`:''}
${cross.length?`<button class="filter-tab" data-cat="cross"><span class="dot" style="background:linear-gradient(95deg,var(--c-moral),var(--c-tech))"></span>교차 <span class="ct">${cross.length}</span></button>`:''}
</div>
<div class="book-list" id="book-list">
${connBooks.map(b=>{const bi=subjInfo((b.subjects||[])[0]||std.subject);return `<a href="#/book/${b.slug}" class="book-row" data-category="${b.category}"><div class="mini-cover" style="background:linear-gradient(160deg,${bi.deep},${bi.color})"></div><div class="info"><h4>${b.title}</h4><div class="byline">${b.author} · ${b.publisher} · ${b.year}</div><div class="detail-pills">${(b.ksdgs_goals||[]).map(g=>`<span class="detail-pill" style="background:${SDG_COLORS[g]}1A;color:${SDG_COLORS[g]}"><span class="num-mini" style="${sdgBg(g)}">${g}</span>${g}</span>`).join('')}</div></div><span class="arrow" style="color:${si.color}">→</span></a>`}).join('')}
</div></div></section>

<div class="next-section"><div class="next-grid">
${prevStd?`<a href="#/standard/${prevStd.code}" class="next-card prev"><div class="lbl"><span>이전</span><span class="arr">→</span></div><div class="next-code">${prevStd.code}</div><p class="next-text">${prevStd.text}</p></a>`:'<div></div>'}
${nextStd?`<a href="#/standard/${nextStd.code}" class="next-card"><div class="lbl"><span>다음</span><span class="arr">→</span></div><div class="next-code">${nextStd.code}</div><p class="next-text">${nextStd.text}</p></a>`:'<div></div>'}
</div></div>
${footer('archive')}
</div>`;

  document.querySelectorAll('.filter-tab').forEach(btn=>{
    btn.addEventListener('click',function(){
      document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      this.style.color = si.color;
      const cat = this.dataset.cat;
      document.querySelectorAll('.book-row').forEach(r=>{
        r.style.display = cat==='all'||r.dataset.category===cat ? '' : 'none';
      });
    });
  });
}

/* ============ RENDER: BOOK DETAIL ============ */
function renderBook(slug){
  scrollTop();
  const book = findBook(slug);
  if(!book) return renderHome();
  const isCross = book.category==='cross_subject';
  const isMulti = book.category==='multi_standard';
  const si = subjInfo((book.subjects||[])[0]||'과학');
  const coverBg = `linear-gradient(160deg,${si.deep},${si.color})`;
  const primaryStd = book.standards && book.standards[0] ? findStd(book.standards[0]) : null;
  const allConnStds = (book.standards||[]).map(c=>findStd(c)).filter(Boolean);
  const primaryGoal = (book.ksdgs_goals||[])[0];
  const related = relatedBooks(book, 3);
  const catLabel = isCross?'교차 교과':isMulti?'복수 성취기준':'단일 성취기준';
  const firstSubj = (book.subjects||[])[0]||'과학';
  const backSubj = firstSubj;

  document.getElementById('app').innerHTML = `
<div class="page-book" style="background:radial-gradient(circle at 18% 8%,${si.color}08 0%,transparent 35%),radial-gradient(circle at 90% 88%,rgba(63,126,68,.04) 0%,transparent 40%),var(--c-cream)">
${nav('archive','subject')}
${breadcrumb('archive',[{text:'홈',href:'#/'},{text:backSubj==='기술가정'?'기술·가정':backSubj,href:'#/subject/'+backSubj},{text:primaryStd?primaryStd.code:'성취기준',href:primaryStd?'#/standard/'+primaryStd.code:''},{text:book.title}])}
<div class="archive-container-wide">
${primaryStd?`<a href="#/standard/${primaryStd.code}" class="back-link"><span class="arrow">←</span> ${primaryStd.code} 목록으로</a>`:''}
<section class="hero-book"><div class="hero-grid">
<div class="book-cover" style="background:${coverBg}">
<div class="cover-eyebrow" style="color:${isCross?'#FF3A21':'#E5243B'}">${si.en}</div>
<div class="cover-title">${book.title.length>18?book.title.substring(0,18)+'…':book.title}</div>
<div class="cover-rule" style="background:${isCross?'#FF3A21':'#E5243B'}"></div>
<div class="cover-author">${book.author}</div>
<div class="cover-meta-text">K-SDGs READER</div>
${(book.ksdgs_goals||[]).length<=1?
  (primaryGoal?`<div class="sdg-badge" style="${sdgBg(primaryGoal)}">${primaryGoal}</div>`:''):
  `<div class="sdg-stack">${(book.ksdgs_goals||[]).map(g=>`<div class="sdg-badge" style="${sdgBg(g)}">${g}</div>`).join('')}</div>`}
</div>
<div class="book-info">
<div class="book-tags">
${allConnStds.map(st=>`<a href="#/standard/${st.code}" class="tag-code" style="background:${subjInfo(st.subject).color};color:#fff;font-size:11px">${st.code}</a>`).join('')}
<span class="tag-category${isCross?' cross':''}">${catLabel}</span>
</div>
<h1 class="book-title">${book.title}</h1>
<div class="book-byline">${book.author} · ${book.publisher}, ${book.year}</div>
${allConnStds.map(st=>`<div class="connected-standard" style="border-left:3px solid ${subjInfo(st.subject).color}"><span class="label" style="color:${subjInfo(st.subject).color}">성취기준</span><span class="code-inline" style="background:${subjInfo(st.subject).bg};color:${subjInfo(st.subject).color}">${st.code}</span>${st.text}</div>`).join('')}
<div class="cta-row">
${book.reading_url?`<a href="${book.reading_url}" class="btn-primary" target="_blank">독서로 바로가기 →</a>`:''}
${primaryStd?`<a href="#/standard/${primaryStd.code}" class="btn-secondary">성취기준 페이지 →</a>`:''}
</div>
</div></div></section>

<div class="meta-card">
<div class="meta-cell"><div class="eyebrow" style="font-size:9.5px;letter-spacing:.18em;color:var(--c-orange);font-weight:600">카테고리</div><div class="key-text">${catLabel}</div><div class="key-sub">${isCross?'2개 이상 교과의 성취기준에 동시 수록':isMulti?'같은 교과 2개 이상 성취기준에 수록':'하나의 성취기준에만 수록된 도서'}</div></div>
<div class="meta-cell"><div class="eyebrow" style="font-size:9.5px;letter-spacing:.18em;color:var(--c-orange);font-weight:600">출판 정보</div><div class="key-fig">${book.year}</div><div class="key-sub">${book.publisher}<br/>${book.isbn||''}</div></div>
<div class="meta-cell"><div class="eyebrow" style="font-size:9.5px;letter-spacing:.18em;color:var(--c-orange);font-weight:600">K-SDGs 연결</div>
${(book.ksdgs_goals||[]).length<=1?
  (primaryGoal?`<div class="sdg-row"><div class="sdg-icon" style="${sdgBg(primaryGoal)}">${primaryGoal}</div><div class="sdg-info"><div class="name">${(findSDG(primaryGoal)||{}).name||''}</div><div class="count">${(book.ksdgs_tags||[]).filter(t=>parseInt(t)===primaryGoal).length} 세부목표</div></div></div>`:'<div class="key-sub">연결 없음</div>'):
  `<div class="sdg-group">${(book.ksdgs_goals||[]).map(g=>`<div class="sdg-row-mini"><div class="sdg-icon" style="${sdgBg(g)}">${g}</div><div class="sdg-info"><div class="name">${(findSDG(g)||{}).name||''}</div><div class="count">${(book.ksdgs_tags||[]).filter(t=>parseInt(t)===g).length} 세부목표</div></div></div>`).join('')}</div>`
}
</div></div>

${book.review?`<section class="section-review">
<div class="eyebrow">REVIEW · 해제</div><div class="divider"></div>
<p class="review-text">${book.review}</p>
${book.review_source?`<div class="review-source">— ${book.review_source}</div>`:''}
</section>`:''}

${isCross||isMulti?renderBookCrossLessons(book,allConnStds):renderBookLessons(book,primaryStd)}

${related.length?`<section class="section-related"><div class="eyebrow">RELATED · 관련 도서</div><div class="divider"></div>
<div class="related-grid">${related.map(rb=>{const rsi=subjInfo((rb.subjects||[])[0]||'과학');return `<a href="#/book/${rb.slug}" class="related-card"><div class="mini-cover" style="background:linear-gradient(160deg,${rsi.deep},${rsi.color})">${(rb.ksdgs_goals||[])[0]?`<span class="badge" style="${sdgBg((rb.ksdgs_goals||[])[0])}">${(rb.ksdgs_goals||[])[0]}</span>`:''}</div><div class="mini-info"><h4>${rb.title}</h4><div class="mini-byline">${rb.author} · ${rb.year}</div></div></a>`}).join('')}</div>
</section>`:''}
</div>

<div class="bottom-cta">
<div class="bottom-cta-inner">
<div class="text-wrap">
<div class="eyebrow-light">READY TO USE</div>
<h3>이 도서를 독서로에서 바로 찾아보세요</h3>
</div>
<a href="${book.reading_url||'#'}" target="_blank" class="gold-btn">독서로에서 보기 ↗</a>
</div>
</div>

${footer('archive')}
</div>`;
}

function renderBookLessons(book, primaryStd){
  if(!book.connections||!book.connections.length) return '';
  return `<section class="section-review" style="margin-top:12px;">
<div class="eyebrow">LESSON · 수업 활용</div><div class="divider"></div>
${book.connections.map(l=>{const n=parseInt(l.sdg_detail); return `<p class="review-text" style="margin-bottom:12px;"><span style="display:inline-block; margin-right:8px; font-family:var(--font-mono); font-size:11px; font-weight:600; color:${SDG_COLORS[n]}; background:${SDG_COLORS[n]}1A; padding:2px 6px; border-radius:3px; vertical-align:middle; line-height:1;">${l.sdg_detail}</span>${l.usage||''}</p>`}).join('')}
</section>`;
}

function renderBookCrossLessons(book, allStds){
  if(!book.connections||!book.connections.length) return '';
  const byStd = {};
  allStds.forEach(st=>{byStd[st.code]=st;});
  const grouped = {};
  book.connections.forEach(l=>{
    const key = l.standard||allStds[0].code;
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(l);
  });
  return `<section class="section-review" style="margin-top:12px;">
<div class="eyebrow">LESSON · 교차 교과 수업 활용</div><div class="divider"></div>
${Object.keys(grouped).map(code=>{
  const st = byStd[code]||findStd(code);
  if(!st) return '';
  const si = subjInfo(st.subject);
  const lessons = grouped[code];
  return `<div style="margin-bottom:24px;">
<p style="font-family:var(--font-sans); font-size:11px; font-weight:700; color:var(--c-ink-faint); margin-bottom:6px; letter-spacing:0.02em;">${st.subject} · ${st.code}</p>
${lessons.map(l=>{const n=parseInt(l.sdg_detail); return `<p class="review-text" style="margin-bottom:12px;"><span style="display:inline-block; margin-right:8px; font-family:var(--font-mono); font-size:11px; font-weight:600; color:${SDG_COLORS[n]}; background:${SDG_COLORS[n]}1A; padding:2px 6px; border-radius:3px; vertical-align:middle; line-height:1;">${l.sdg_detail}</span>${l.usage||''}</p>`}).join('')}
</div>`}).join('')}
</section>`;
}

/* ============ RENDER: HOWTO ============ */
function renderHowto(){
  scrollTop();
  const m = D.meta;
  document.getElementById('app').innerHTML = `
<div class="page-howto">
${nav('archive','howto')}
${breadcrumb('archive',[{text:'홈',href:'#/'},{text:'사용법'}])}
<div class="archive-container">
<header class="howto-page-header">
<h1 class="howto-page-title">K-SDGs Reader<br/>사용법</h1>
<p class="howto-page-subtitle">이 길잡이는 2022 개정 교육과정 중학교 4교과 성취기준과 K-SDGs, 중학생 권장 도서를 연결합니다. 아래 안내에 따라 수업에 필요한 도서와 활용 방안을 찾아보세요.</p>
</header>

<section class="howto-section-block first">
<div class="section-num">SECTION 01</div>
<h2 class="section-title">기본 사용법: 3단계</h2>
<p class="body-text">K-SDGs Reader는 <span class="accent">성취기준에서 시작해 도서와 활용 방안으로 도달</span>하는 흐름으로 설계되었습니다. 아래 세 단계를 따라가면 됩니다.</p>
<div class="stats-inline">
<div class="stat-pill"><div class="v">${m.total_standards}</div><div class="l">STANDARDS</div></div>
<div class="stat-pill"><div class="v">${m.total_books}</div><div class="l">BOOKS</div></div>
<div class="stat-pill"><div class="v">${m.total_lessons}</div><div class="l">LESSONS</div></div>
</div>
<div class="steps-list">
<div class="step-item"><div class="step-num">01</div><div>
<div class="step-sub">CHOOSE SUBJECT</div><h3 class="step-title">교과를 선택합니다</h3>
<p class="step-body">홈 화면에서 <span class="accent">4개 교과</span>(과학, 도덕, 기술·가정, 사회) 카드 중 지금 수업에서 다룰 교과를 누릅니다.</p>
<div class="step-tip"><strong>TIP</strong> 각 카드에 해당 교과의 성취기준 수와 도서 수가 표시되어 규모를 한눈에 파악할 수 있습니다.</div>
</div></div>
<div class="step-item"><div class="step-num">02</div><div>
<div class="step-sub">SELECT STANDARD</div><h3 class="step-title">성취기준을 고릅니다</h3>
<p class="step-body">교과 화면에서 이번 수업의 성취기준을 찾아 누릅니다. 각 성취기준에는 연결된 K-SDGs 세부목표가 태그로 표시됩니다. 해당 성취기준 상세 페이지로 이동하면 K-SDGs 연결 지도와 도서 목록을 볼 수 있습니다.</p>
</div></div>
<div class="step-item"><div class="step-num">03</div><div>
<div class="step-sub">OPEN BOOK</div><h3 class="step-title">도서를 열어 수업에 활용합니다</h3>
<p class="step-body">성취기준 페이지 하단에서 연결된 도서를 눌러 상세 페이지로 이동합니다. 도서 해제, K-SDGs 세부목표별 <span class="accent">수업 활용 방안</span>, 독서로 링크가 한 페이지에 정리되어 있습니다.</p>
<div class="step-tip"><strong>TIP</strong> 교차 교과 도서는 2개 이상 교과의 수업 활용 방안이 교과별로 구분되어 표시됩니다.</div>
</div></div>
</div>

<div class="alt-route">
<div class="alt-eye">ALTERNATE</div>
<h4>대안 경로: K-SDGs 목표에서 거꾸로</h4>
<p>"기후변화 수업을 하고 싶은데 어떤 성취기준이 있을까?"라면 <span class="pill">K-SDGs 색인</span> 메뉴를 이용하세요. 17개 목표에서 출발해 관련 성취기준·도서로 역추적할 수 있습니다.</p>
</div>
</section>

<section class="howto-section-block">
<div class="section-num">SECTION 02</div>
<h2 class="section-title">용어 정리</h2>
<p class="body-text">길잡이에서 사용하는 핵심 용어를 정리했습니다.</p>
<div class="glossary">
<div class="term-row"><div class="term-name">성취기준<span class="alt">Achievement Standard</span></div><div class="term-def">2022 개정 교육과정에서 각 교과별로 학생이 도달해야 할 지식·기능·태도를 기술한 문장. 코드 형식은 <code>9과02-03</code>처럼 학년군·교과·영역·순서 조합입니다.<span class="ex">9과17-01 = 중학교(9) 과학(과) 17번 영역 1번 기준</span></div></div>
<div class="term-row"><div class="term-name">K-SDGs<span class="alt">한국형 SDGs</span></div><div class="term-def">유엔 SDGs(지속가능발전목표)를 한국의 맥락에 맞게 재구성한 17개 국가 목표. 각 목표 아래에 세부목표가 있으며, 코드는 <code>13-2</code>처럼 목표-순서 조합입니다.<span class="ex">13-2 = K-SDGs 13번(기후변화 대응) 2번 세부목표</span></div></div>
<div class="term-row"><div class="term-name">해제<span class="alt">Review</span></div><div class="term-def">도서의 내용·주제·가치를 학교도서관 활용수업 관점에서 분석한 짧은 글. 이 길잡이의 해제는 원 출처의 소개글을 SDGs 교육적 관점에서 재구성한 것입니다.</div></div>
<div class="term-row"><div class="term-name">수업 활용<span class="alt">Lesson Usage</span></div><div class="term-def">특정 도서를 특정 성취기준·K-SDGs 세부목표와 연계하여 학교도서관 활용수업에 적용하는 구체적 방안. 교사가 직접 수업에 활용할 수 있는 문장으로 기술됩니다.</div></div>
</div></section>

<section class="howto-section-block">
<div class="section-num">SECTION 03</div>
<h2 class="section-title">도서 카테고리</h2>
<p class="body-text">${m.total_books}권의 도서는 성취기준 연결 방식에 따라 <span class="em">3가지</span>로 분류됩니다.</p>
<div class="cat-table">
<div class="cat-row head"><div>카테고리</div><div>도서 수</div><div>설명</div></div>
<div class="cat-row"><div class="cat-name single">단일 성취기준</div><div class="cat-num">88<span class="pct">65.7%</span></div><div class="cat-desc">하나의 성취기준에만 수록된 도서. 해당 기준에 집중적으로 활용하기에 적합합니다.</div></div>
<div class="cat-row"><div class="cat-name multi">복수 성취기준</div><div class="cat-num">6<span class="pct">4.5%</span></div><div class="cat-desc">같은 교과 내 2개 이상 성취기준에 수록. 같은 교과 범위 안에서 다양하게 활용할 수 있습니다.</div></div>
<div class="cat-row"><div class="cat-name cross">교차 교과</div><div class="cat-num">40<span class="pct">29.9%</span></div><div class="cat-desc">2개 이상 교과의 성취기준에 동시 수록. 융합 수업 설계에 적합합니다.</div></div>
</div></section>

<section class="howto-section-block">
<div class="section-num">SECTION 04</div>
<h2 class="section-title">출처와 인용</h2>
<p class="body-text">이 길잡이의 데이터는 아래 연구의 결과물입니다.</p>
<div class="source-box">
<div class="source-row"><div class="source-key">연구자</div><div class="source-val">강정한</div></div>
<div class="source-row"><div class="source-key">연구보고서 제목</div><div class="source-val">학교도서관 활용수업을 위한 SDGs 정보길잡이 개발에 관한 연구</div></div>
<div class="source-row"><div class="source-key">소속</div><div class="source-val">국립공주대학교 교육대학원 문헌정보교육전공</div></div>
<div class="source-row"><div class="source-key">학위</div><div class="source-val">석사학위 연구보고서</div></div>
<div class="source-row"><div class="source-key">연도</div><div class="source-val">2026</div></div>
<div class="source-row"><div class="source-key">도서 출처</div><div class="source-val">SDG Book Club Korea · 학교도서관ing · 대구대표도서관 · 독서로</div></div>
</div>
<p class="body-text" style="margin-top:24px"><span class="accent">인용 시 아래 문구를 사용하세요:</span></p>
<blockquote class="cite-block">강정한. (2026). 학교도서관 활용수업을 위한 SDGs 정보길잡이 개발에 관한 연구. 국립공주대학교 석사학위 연구보고서.</blockquote>
</section>
</div>
${footer('archive')}
</div>`;
}

/* Close the IIFE */
})();

