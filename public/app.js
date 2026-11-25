(() => {
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.append(e); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ───── 상단 배너 효과: 반짝이, 번개, 여자 클릭 ───── */
  const FLARES = [[115, 100, 1.2], [1190, 62, 1], [1660, 88, 1.1], [1250, 440, 1.2], [1130, 300, .6], [40, 430, .6], [890, 70, .7]];
  const stars = $("stars");
  FLARES.forEach(([x, y, k], i) => {
    const g = el("g", { class: "flare" }, stars);
    g.style.animationDelay = (i * .37) + "s";
    el("circle", { cx: x, cy: y, r: 34 * k, fill: "url(#flareG)" }, g);
    el("path", { d: `M${x - 70 * k} ${y} H${x + 70 * k} M${x} ${y - 70 * k} V${y + 70 * k}`, stroke: "#fff", "stroke-width": 3 * k, "stroke-linecap": "round" }, g);
    el("path", { d: `M${x - 26 * k} ${y - 26 * k} L${x + 26 * k} ${y + 26 * k} M${x + 26 * k} ${y - 26 * k} L${x - 26 * k} ${y + 26 * k}`, stroke: "#cfe6ff", "stroke-width": 1.5 * k }, g);
  });
  for (let i = 0; i < 45; i++) {
    const c = el("circle", { cx: rnd(0, 1720), cy: rnd(0, 521), r: rnd(1.5, 4), fill: Math.random() < .4 ? "#9fd0ff" : "#fff", class: "twinkle" }, stars);
    c.style.animationDelay = rnd(0, 2) + "s";
  }

  function bolt(x1, y1, x2, y2, jitter, n) {
    let d = `M${x1} ${y1}`;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      d += ` L${(x1 + (x2 - x1) * t + rnd(-jitter, jitter)).toFixed(1)} ${(y1 + (y2 - y1) * t + rnd(-jitter, jitter)).toFixed(1)}`;
    }
    return d + ` L${x2} ${y2}`;
  }
  function drawBolts() {
    const g = $("bolts"); g.textContent = "";
    const [ox, oy] = FLARES[(Math.random() * 4) | 0];
    const count = 2 + ((Math.random() * 4) | 0);
    for (let i = 0; i < count; i++) {
      const a = rnd(0, Math.PI * 2), len = rnd(140, 380);
      el("path", { d: bolt(ox, oy, ox + Math.cos(a) * len, oy + Math.sin(a) * len * .6, 22, 10), "stroke-width": rnd(2, 4.5), opacity: rnd(.5, 1) }, g);
    }
    if (Math.random() < .15) {   // 가끔 큰 번개 + 번쩍
      const x = rnd(1000, 1600);
      el("path", { d: bolt(x, 0, x + rnd(-200, 200), 521, 30, 16), "stroke-width": 5, opacity: .9 }, g);
      const f = $("flash"); f.setAttribute("opacity", .18); setTimeout(() => f.setAttribute("opacity", 0), 70);
    }
    const s = $("stripBolts"); s.textContent = "";
    for (let i = 0; i < 3; i++) el("path", { d: bolt(0, 15, 1010, 15, 7, 60), "stroke-width": i ? .8 : 1.6, opacity: i ? .5 : .9 }, s);
  }
  drawBolts();
  setInterval(() => { drawBolts(); $("bolts").style.opacity = Math.random() < .35 ? 0 : 1; }, 160);

  const header = document.querySelector(".header");
  $("woman").addEventListener("click", () => {
    header.classList.add("glitch");
    setTimeout(() => header.classList.remove("glitch"), 320);
    header.classList.toggle("nocig");
  });

  /* ───── 이벤트 배너 효과 ───── */
  const EVF = [[90, 55, 1.1], [1700, 175, 1.2], [1555, 600, 1], [1060, 600, .8], [640, 130, .7], [1250, 420, .6], [300, 330, .6]];
  const evStars = $("evStars");
  EVF.forEach(([x, y, k], i) => {
    const g = el("g", { class: "flare" }, evStars);
    g.style.animationDelay = (i * .31) + "s";
    el("circle", { cx: x, cy: y, r: 36 * k, fill: "url(#flareG)" }, g);
    el("path", { d: `M${x - 80 * k} ${y} H${x + 80 * k} M${x} ${y - 80 * k} V${y + 80 * k}`, stroke: "#fff", "stroke-width": 3.5 * k, "stroke-linecap": "round" }, g);
    el("path", { d: `M${x - 28 * k} ${y - 28 * k} L${x + 28 * k} ${y + 28 * k} M${x + 28 * k} ${y - 28 * k} L${x - 28 * k} ${y + 28 * k}`, stroke: "#ffe6ff", "stroke-width": 1.5 * k }, g);
  });
  for (let i = 0; i < 40; i++) {
    const c = el("circle", { cx: rnd(0, 2172), cy: rnd(0, 712), r: rnd(2, 5), fill: Math.random() < .5 ? "#ffe680" : "#fff", class: "twinkle" }, evStars);
    c.style.animationDelay = rnd(0, 2) + "s";
  }
  function drawEvBolts() {
    const g = $("evBolts"); g.textContent = "";
    const n = 1 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const y = rnd(150, 600), x = rnd(200, 1400);
      el("path", { d: bolt(x, y, x + rnd(400, 800), y + rnd(-120, 120), 26, 14), "stroke-width": rnd(2.5, 5), opacity: rnd(.5, 1), stroke: Math.random() < .5 ? "#f0c8ff" : "#cfe6ff" }, g);
    }
  }
  setInterval(() => { drawEvBolts(); $("evBolts").style.opacity = Math.random() < .4 ? 0 : 1; }, 140);
  $("evBanner").addEventListener("click", () => showPopup("속았지? 2001.EXE는 돈 말고 수다만 무제한 지급합니다 ^^"));

  /* ───── 효과음 (이모티콘 라벨 더블클릭으로 켜기/끄기) ───── */
  let soundOn = false, actx = null;
  $("snd").addEventListener("dblclick", () => {
    soundOn = !soundOn;
    if (soundOn && !actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    showPopup(soundOn ? "새 메시지 효과음 ON (띵동~)" : "새 메시지 효과음 OFF");
    beep();
  });
  function beep() {
    if (!soundOn || !actx) return;
    [988, 784].forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * .14;
      o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + .25);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .26);
    });
  }

  /* ───── 채팅 ───── */
  const log = $("log"), msg = $("msg"), send = $("send"), statusEl = $("status");
  const isTouch = matchMedia("(pointer: coarse)").matches;

  /* ───── 채팅 크게 보기 ───── */
  const vv = window.visualViewport;
  function syncVV() {   // 키보드가 올라오면 보이는 영역에 딱 맞게 채팅창 크기 조절
    if (!document.body.classList.contains("chatfull")) return;
    const wasBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 30;
    document.documentElement.style.setProperty("--vvH", Math.round(vv ? vv.height : innerHeight) + "px");
    if (wasBottom) log.scrollTop = log.scrollHeight;   // 키보드가 올라와도 최신 대화가 보이게
    if (scrollY !== 0) scrollTo(0, 0);   // 키보드 때문에 밀려 올라간 화면을 맨 위로 되돌림
  }
  if (vv) { vv.addEventListener("resize", syncVV); vv.addEventListener("scroll", syncVV); }
  addEventListener("resize", syncVV);
  function openChat() {
    if (document.body.classList.contains("chatfull")) return;
    document.body.classList.add("chatfull"); scrollTo(0, 0); syncVV();
    setTimeout(syncVV, 300); setTimeout(syncVV, 700);   // 키보드 애니메이션이 끝난 뒤 한 번 더 맞춤
    log.scrollTop = log.scrollHeight; unseen = 0; $("newMsg").hidden = true;
    history.pushState({ chat: 1 }, "");   // 휴대폰 뒤로가기 = 채팅 닫기
  }
  function closeChat() {
    document.body.classList.remove("chatfull");
    document.documentElement.style.removeProperty("--vvH");
    if (document.activeElement === msg) msg.blur();
  }
  addEventListener("popstate", closeChat);
  $("liveBtn").addEventListener("click", openChat);
  $("chatExit").addEventListener("click", () => { history.state?.chat ? history.back() : closeChat(); });
  // 휴대폰에서는 입력칸을 눌러도 크게 열림
  msg.addEventListener("focus", () => { if (isTouch) openChat(); });
  const COLORS = ["#3cff6a", "#2ab8ff", "#b48cff", "#5ab0ff", "#39e6a0", "#7fd0ff", "#ffd23a", "#ff8ad8"];
  let ws = null, retry = 0, banned = false, adminKey = null, isAdmin = false, loading = false, unseen = 0, locked = false;
  function applyLock(on) {   // 채팅 잠금 상태를 화면에 반영 (관리자는 계속 입력 가능)
    locked = on;
    $("lockBar").hidden = !on;
    const block = on && !isAdmin;
    msg.disabled = block || banned; send.disabled = block || banned;
    msg.placeholder = block ? "채팅방이 얼었어요... 잠시만요 (_ _)" : "";
    $("lockBtn").textContent = on ? "채팅 열기" : "채팅 닫기";
    $("lockBtn").classList.toggle("on", on);
  }
  $("newMsg").addEventListener("click", () => { log.scrollTop = log.scrollHeight; });
  log.addEventListener("scroll", () => {
    if (log.scrollHeight - log.scrollTop - log.clientHeight < 4) { unseen = 0; $("newMsg").hidden = true; }
  });
  const color = (nick) => { let h = 0; for (const ch of nick) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return COLORS[h % COLORS.length]; };
  const time = (ts) => new Date(ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" });
  const wsSend = (o) => ws && ws.readyState === 1 && ws.send(JSON.stringify(o));

  function add(m) {
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 4;
    const row = document.createElement("div"); row.className = "m";
    const ts = document.createElement("span"); ts.className = "ts"; ts.textContent = `[${time(m.ts)}]`; row.append(ts);
    if (m.type === "system") {
      const s = document.createElement("span"); s.className = "sys"; s.textContent = `※ ${m.text}`; row.append(s);
    } else {
      row.dataset.id = m.id;
      if (m.mine) row.classList.add("mine");
      if (m.admin) row.classList.add("adm");
      const nk = document.createElement("span"); nk.className = "nk"; nk.style.color = m.mine ? "#ffe14a" : color(m.nick); nk.textContent = m.nick;
      const tx = document.createElement("span"); tx.className = "tx"; tx.textContent = `: ${m.text}`;
      row.append(nk, tx);
      // 관리자 모드 버튼: 모든 메시지 [삭제], 관리자 메시지가 아니면 [차단]도
      const del = document.createElement("button"); del.className = "act"; del.dataset.act = "delete"; del.textContent = "삭제";
      row.append(del);
      if (!m.admin) {
        const ban = document.createElement("button"); ban.className = "act ban"; ban.dataset.act = "ban"; ban.textContent = "차단";
        row.append(ban);
      }
    }
    log.append(row);
    while (log.children.length > 300) log.firstChild.remove();
    // 자동으로 아래로 내려가지 않음 → 아래가 안 보이는 상태면 "새 메시지" 버튼만 표시
    if (!loading && !atBottom) { unseen++; $("newCnt").textContent = unseen; $("newMsg").hidden = false; }
  }

  function presence(d) {
    const ul = $("members"); ul.textContent = "";
    for (const u of d.users) {
      const li = document.createElement("li"); li.textContent = u;
      if (u === d.me) li.className = "me", li.title = "나";
      if (u === "★관리자★") li.classList.add("adm");
      ul.append(li);
    }
    $("count").textContent = $("count2").textContent = d.users.length;
  }

  function connect() {
    if (banned) return;
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${proto}//${location.host}/ws`);
    statusEl.textContent = "웹 사이트 http://2001exe.top/ 을(를) 여는 중...";
    ws.onopen = () => { retry = 0; };
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      switch (d.type) {
        case "welcome":
          log.textContent = "";
          loading = true; d.history.forEach(add); loading = false;
          log.scrollTop = log.scrollHeight; unseen = 0; $("newMsg").hidden = true;
          add({ type: "system", text: "익명으로 입장하셨습니다. 채팅을 칠 때마다 닉네임이 바뀝니다.", ts: Date.now() });
          send.disabled = false; msg.disabled = false;
          applyLock(!!d.locked);
          if (!isTouch && !d.locked) msg.focus();   // 휴대폰에서는 자동으로 키보드 안 띄움
          statusEl.textContent = "완료";
          if (adminKey) wsSend({ type: "admin_login", key: adminKey });
          break;
        case "presence": presence(d); break;
        case "lock": applyLock(d.on); break;
        case "delete":
          d.ids.forEach((id) => log.querySelector(`.m[data-id="${CSS.escape(id)}"]`)?.remove());
          break;
        case "banned":
          banned = true; send.disabled = true; msg.disabled = true;
          statusEl.textContent = "접속이 차단되었습니다.";
          showPopup("관리자에 의해 접속이 차단되었습니다.");
          break;
        case "admin_ok":
          isAdmin = true; document.body.classList.add("admin");
          $("adminBar").hidden = false; $("adminDlg").classList.remove("show");
          renderBans(d.bans); applyLock(locked);
          break;
        case "admin_fail":
          adminKey = null; $("adminErr").textContent = d.text;
          break;
        case "bans": renderBans(d.bans); break;
        default: add(d);
      }
    };
    ws.onclose = () => {
      send.disabled = true;
      if (banned) return;
      const wait = Math.min(1000 * 2 ** retry++, 15000);
      statusEl.textContent = `페이지를 표시할 수 없습니다. ${Math.round(wait / 1000)}초 후 다시 연결합니다...`;
      setTimeout(connect, wait);
    };
  }

  $("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = msg.value.trim();
    if (!text) return;
    wsSend({ type: "chat", text }); msg.value = "";
    if (document.activeElement !== msg) msg.focus({ preventScroll: true });
  });
  document.querySelectorAll("[data-emo]").forEach((b) => b.addEventListener("click", () => { msg.value += b.dataset.emo; if (!isTouch) msg.focus(); }));
  // 전송 버튼을 눌러도 입력칸 포커스가 안 풀리게 → 키보드가 닫혔다 열리며 화면이 튀는 것 방지
  ["mousedown", "pointerdown"].forEach((ev) => send.addEventListener(ev, (e) => { if (document.activeElement === msg) e.preventDefault(); }));

  /* ───── 관리자 ───── */
  // 주소 끝에 #admin 을 붙여서 접속하면 로그인 창이 뜸 (예: https://사이트주소/#admin)
  function openAdmin() { $("adminErr").textContent = ""; $("adminDlg").classList.add("show"); $("adminKey").focus(); }
  if (location.hash === "#admin") openAdmin();
  window.addEventListener("hashchange", () => location.hash === "#admin" && !isAdmin && openAdmin());
  $("adminForm").addEventListener("submit", (e) => {
    e.preventDefault();
    adminKey = $("adminKey").value; $("adminKey").value = "";
    wsSend({ type: "admin_login", key: adminKey });
  });
  $("adminCancel").addEventListener("click", () => $("adminDlg").classList.remove("show"));
  $("lockBtn").addEventListener("click", () => wsSend({ type: "lock", on: !locked }));
  $("adminOut").addEventListener("click", () => { location.hash = ""; location.reload(); });

  log.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b || !isAdmin) return;
    wsSend({ type: b.dataset.act, id: b.closest(".m").dataset.id });
  });

  function renderBans(bans) {
    $("banListBtn").textContent = `차단 목록 (${bans.length})`;
    const box = $("banList"); box.textContent = "";
    if (!bans.length) { box.innerHTML = '<div class="empty">차단한 사람이 없습니다.</div>'; return; }
    for (const b of bans) {
      const row = document.createElement("div"); row.className = "row";
      const id = document.createElement("code"); id.textContent = "#" + b.h.slice(0, 6);
      const t = document.createElement("span"); t.textContent = `${new Date(b.ts).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })} · "${b.sample}"`;
      const un = document.createElement("button"); un.className = "dbtn"; un.textContent = "해제";
      un.addEventListener("click", () => wsSend({ type: "unban", h: b.h }));
      row.append(id, t, un); box.append(row);
    }
  }
  $("banListBtn").addEventListener("click", () => $("banDlg").classList.add("show"));
  $("banClose").addEventListener("click", () => $("banDlg").classList.remove("show"));

  /* ───── 링크 설정: 따옴표 안에 주소를 넣으면 누를 때 그 주소로 이동 (비워두면 기존 팝업) ───── */
  const LINKS = {
    cs: "https://band.us/n/aba2bbW2W9l7q",              // 고객센터
    community: "https://pushoong.com/ask/2874661266",   // 커뮤니티
  };
  document.querySelectorAll("[data-link]").forEach((x) => x.addEventListener("click", (e) => {
    const url = LINKS[x.dataset.link];
    if (!url) return;                       // 링크 없으면 팝업이 대신 뜸
    e.stopImmediatePropagation();
    window.open(url, "_blank", "noopener");
  }, true));

  /* ───── 이스터에그: 쿠폰 등록 ───── */
  const cdlg = $("couponDlg");
  function openCoupon() {
    $("couponForm").hidden = false; $("couponStep").hidden = true; $("prize").hidden = true; $("prizeFoot").hidden = true;
    $("couponOk").disabled = false; $("couponCode").value = ""; cdlg.classList.add("show"); $("couponCode").focus();
  }
  $("hotEvent").addEventListener("click", openCoupon);
  $("couponCancel").addEventListener("click", () => cdlg.classList.remove("show"));
  $("prizeClose").addEventListener("click", () => cdlg.classList.remove("show"));
  $("couponForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("couponCode").value.trim().toUpperCase();
    if (!code) { $("couponCode").focus(); return; }
    $("couponOk").disabled = true; $("couponStep").hidden = false;
    const bar = $("couponBar"); bar.textContent = "";
    const msgs = ["쿠폰 번호 확인 중...", "서버에 접속 중...", "당첨 여부 조회 중...", "두근두근..."];
    let i = 0;
    const iv = setInterval(() => {
      i++; bar.append(document.createElement("i"));
      $("couponMsg").textContent = msgs[Math.min(Math.floor(i / 6), msgs.length - 1)];
      if (i >= 24) { clearInterval(iv); showPrize(code); }
    }, 90);
  });
  function showPrize(code) {
    $("couponForm").hidden = true;
    const p = $("prize"); p.hidden = false; $("prizeFoot").hidden = false;
    const safe = code.replace(/[^0-9A-Z가-힣-]/g, "").slice(0, 16);
    const special = safe === "2001" || safe === "2001EXE";
    p.innerHTML = special
      ? `<div class="big">★☆ 히든 쿠폰 발견 ☆★</div>
         <div>쿠폰번호 <span class="gold">[${safe}]</span></div>
         <div class="gold">당신은 진정한 2001년 감성인 ㅠ_ㅠb</div>
         <div>상품: <span class="pink">마음속 싸이월드 도토리 100개</span></div>
         <div>열심히 대화나 합시다 ^ㅡ^*</div>`
      : `<div class="big">★☆ 축하드립니다 ☆★</div>
         <div>쿠폰번호 <span class="gold">[${safe}]</span> 당첨!!</div>
         <div>상품: <span class="dim">..............</span> 없음 ㅋㅋㅋㅋ</div>
         <div class="gold" style="font-size:20px">또 속았네? -_-v</div>
         <div class="pink">돈은 없고 수다만 무제한~♬</div>
         <div>열심히 대화나 합시다 ^ㅡ^*</div>
         <div class="dim">ⓒ 2001.EXE 이벤트팀 (퇴근함)</div>`;
  }

  /* ───── 공지 팝업 (처음 접속 시 / 공지사항 버튼) ───── */
  const ndlg = $("noticeDlg");
  function openNotice() { $("noticeToday").checked = false; ndlg.classList.add("show"); }
  function closeNotice() {
    if ($("noticeToday").checked) {   // 오늘 하루 안 보기: 한국 시간 내일 0시까지
      const k = new Date(Date.now() + 9 * 3600e3); k.setUTCHours(24, 0, 0, 0);
      try { localStorage.setItem("noticeHideUntil", String(k.getTime() - 9 * 3600e3)); } catch {}
    }
    ndlg.classList.remove("show");
  }
  $("noticeBtn").addEventListener("click", openNotice);
  $("noticeClose").addEventListener("click", closeNotice);
  $("noticeX").addEventListener("click", closeNotice);
  let hideUntil = 0;
  try { hideUntil = Number(localStorage.getItem("noticeHideUntil")) || 0; } catch {}
  if (Date.now() > hideUntil && location.hash !== "#admin") setTimeout(openNotice, 400);

  /* ───── 팝업 ───── */
  const popup = $("popup");
  function showPopup(t) { $("popupText").textContent = t; popup.classList.add("show"); $("popupOk").focus(); }
  document.querySelectorAll("[data-pop]").forEach((x) => x.addEventListener("click", () => showPopup(x.dataset.pop)));
  $("popupOk").addEventListener("click", () => popup.classList.remove("show"));

  connect();
})();
