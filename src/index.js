import { DurableObject } from "cloudflare:workers";

const MAX_HISTORY = 100;   // 저장할 최근 메시지 수
const MAX_LEN = 300;       // 메시지 최대 글자 수
const COOLDOWN_MS = 700;   // 도배 방지 간격
const ADMIN_NICK = "★관리자★";
const GHOST_SLOTS = 32;    // 유령 접속자 후보 수 (평균 절반 정도가 접속 중으로 보임)
const PRESENCE_TICK = 45000; // 유령 접속자 목록 갱신 주기

const WORDS = [
  "guest", "toto", "dark", "lucky", "champion", "shadow", "ghost", "neo",
  "cyber", "zero", "matrix", "phantom", "angel", "dragon", "user", "better",
  "anonymous", "nightowl", "pixel", "modem", "winamp", "dialup", "error", "exe",
  "admin_x", "sniper", "blue", "red", "king", "killer", "star", "moon",
];
const SUFFIX = ["", "", "_king", "_01", "_x", "_kr", "zz", "88", "777"];

function nickFrom(rand) {
  const w = WORDS[Math.floor(rand() * WORDS.length)];
  const s = SUFFIX[Math.floor(rand() * SUFFIX.length)];
  const n = Math.floor(rand() * 1000);
  return `${w}${s}${n}`;
}
const randomNick = () => nickFrom(Math.random);

// 같은 시드면 항상 같은 값 → 모든 사람에게 같은 유령 목록이 보임
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 유령 접속자: 각자 몇 분씩 들어왔다 나갔다 하는 가짜 닉네임
function ghosts() {
  const now = Date.now(), out = [];
  for (let i = 0; i < GHOST_SLOTS; i++) {
    const period = (3 + ((i * 7) % 9)) * 60000;
    const k = Math.floor((now + i * 37117) / period);
    const r = seeded(i * 1000003 + k);
    if (r() < 0.55) out.push(nickFrom(r));
  }
  return out;
}

function sortKey(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

async function hashIp(ip, salt) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}|${ip}`));
  return [...new Uint8Array(d)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const strip = ({ h, ...m }) => m; // IP 해시는 절대 브라우저로 보내지 않음

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("WebSocket 연결만 가능합니다", { status: 426 });
      }
      const stub = env.CHAT.get(env.CHAT.idFromName("lobby"));
      return stub.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};

export class ChatRoom extends DurableObject {
  async fetch(request) {
    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);

    const ip = request.headers.get("CF-Connecting-IP") || "local";
    const h = await hashIp(ip, this.env.ADMIN_KEY || "2001exe");
    const bans = (await this.ctx.storage.get("bans")) || {};

    if (bans[h]) {
      server.serializeAttachment({ banned: true });
      server.send(JSON.stringify({ type: "banned" }));
      server.close(4003, "banned");
      return new Response(null, { status: 101, webSocket: client });
    }

    server.serializeAttachment({ nick: randomNick(), h, last: 0, admin: false, tries: 0 });

    const history = (await this.ctx.storage.get("history")) || [];
    server.send(JSON.stringify({ type: "welcome", history: history.map(strip) }));

    this.broadcast({ type: "system", text: "누군가 입장했습니다.", ts: Date.now() });
    await this.broadcastPresence();
    await this.ensureAlarm();

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    const info = this.info(ws);
    if (!info || info.banned || typeof data?.type !== "string") return;

    switch (data.type) {
      case "chat": return this.onChat(ws, info, data);
      case "admin_login": return this.onAdminLogin(ws, info, data);
      case "delete": return info.admin && this.onDelete(data);
      case "ban": return info.admin && this.onBan(ws, info, data);
      case "unban": return info.admin && this.onUnban(ws, data);
    }
  }

  async onChat(ws, info, data) {
    if (typeof data.text !== "string") return;
    const text = data.text.replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
    if (!text) return;

    const now = Date.now();
    if (now - info.last < COOLDOWN_MS) {
      ws.send(JSON.stringify({ type: "system", text: "너무 빨라요! 잠시 후 다시 입력하세요.", ts: now }));
      return;
    }
    info.last = now;
    // 메시지를 보낼 때마다 새 닉네임 (관리자는 고정)
    info.nick = info.admin ? ADMIN_NICK : randomNick();
    ws.serializeAttachment(info);

    const msg = { type: "chat", id: crypto.randomUUID().slice(0, 8), nick: info.nick, text, ts: now, admin: !!info.admin };
    const history = (await this.ctx.storage.get("history")) || [];
    history.push({ ...msg, h: info.h });
    await this.ctx.storage.put("history", history.slice(-MAX_HISTORY));

    const payload = JSON.stringify(msg), mine = JSON.stringify({ ...msg, mine: true });
    for (const s of this.sockets()) {
      if (this.info(s)?.banned) continue;
      try { s.send(s === ws ? mine : payload); } catch {}
    }
    await this.broadcastPresence();
  }

  async onAdminLogin(ws, info, data) {
    if (info.tries >= 5) {
      ws.send(JSON.stringify({ type: "admin_fail", text: "시도 횟수를 초과했습니다. 새로고침 후 다시 시도하세요." }));
      return;
    }
    info.tries++;
    const key = this.env.ADMIN_KEY;
    if (key && typeof data.key === "string" && data.key === key) {
      info.admin = true;
      info.nick = ADMIN_NICK;
      ws.serializeAttachment(info);
      ws.send(JSON.stringify({ type: "admin_ok", bans: await this.banList() }));
      await this.broadcastPresence();
    } else {
      ws.serializeAttachment(info);
      ws.send(JSON.stringify({ type: "admin_fail", text: key ? "비밀번호가 틀렸습니다." : "서버에 관리자 비밀번호(ADMIN_KEY)가 설정되지 않았습니다." }));
    }
  }

  async onDelete(data) {
    const history = (await this.ctx.storage.get("history")) || [];
    const next = history.filter((m) => m.id !== data.id);
    await this.ctx.storage.put("history", next);
    this.broadcast({ type: "delete", ids: [data.id] });
  }

  // 차단: 그 메시지를 쓴 사람(IP 기준)을 차단 + 그 사람 메시지 전부 삭제 + 즉시 강퇴
  async onBan(ws, info, data) {
    const history = (await this.ctx.storage.get("history")) || [];
    const target = history.find((m) => m.id === data.id);
    if (!target) return ws.send(JSON.stringify({ type: "system", text: "이미 지워진 메시지라 차단할 수 없습니다.", ts: Date.now() }));
    if (target.h === info.h) return ws.send(JSON.stringify({ type: "system", text: "자기 자신은 차단할 수 없습니다.", ts: Date.now() }));

    const bans = (await this.ctx.storage.get("bans")) || {};
    bans[target.h] = { ts: Date.now(), sample: target.text.slice(0, 40) };
    await this.ctx.storage.put("bans", bans);

    const removed = history.filter((m) => m.h === target.h).map((m) => m.id);
    await this.ctx.storage.put("history", history.filter((m) => m.h !== target.h));
    this.broadcast({ type: "delete", ids: removed });

    for (const s of this.sockets()) {
      const si = this.info(s);
      if (si && si.h === target.h && !si.admin) {
        si.banned = true;
        s.serializeAttachment(si);
        try { s.send(JSON.stringify({ type: "banned" })); s.close(4003, "banned"); } catch {}
      }
    }
    this.broadcast({ type: "system", text: "관리자에 의해 한 명이 차단되었습니다.", ts: Date.now() });
    await this.sendBans();
    await this.broadcastPresence();
  }

  async onUnban(ws, data) {
    const bans = (await this.ctx.storage.get("bans")) || {};
    delete bans[data.h];
    await this.ctx.storage.put("bans", bans);
    await this.sendBans();
  }

  async banList() {
    const bans = (await this.ctx.storage.get("bans")) || {};
    return Object.entries(bans).map(([h, b]) => ({ h, ...b })).sort((a, b) => b.ts - a.ts);
  }

  async sendBans() {
    const payload = JSON.stringify({ type: "bans", bans: await this.banList() });
    for (const s of this.sockets()) if (this.info(s)?.admin) try { s.send(payload); } catch {}
  }

  async webSocketClose(ws) { await this.leave(ws); }
  async webSocketError(ws) { await this.leave(ws); }

  async leave(ws) {
    const info = this.info(ws);
    try { ws.close(1000, "bye"); } catch {}
    if (info && !info.banned) this.broadcast({ type: "system", text: "누군가 퇴장했습니다.", ts: Date.now() }, ws);
    await this.broadcastPresence(ws);
  }

  async ensureAlarm() {
    if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + PRESENCE_TICK);
  }

  async alarm() {
    if (this.sockets().length) {
      await this.broadcastPresence();
      await this.ctx.storage.setAlarm(Date.now() + PRESENCE_TICK);
    }
  }

  sockets(exclude) {
    return this.ctx.getWebSockets().filter((s) => s !== exclude);
  }

  info(ws) {
    try { return ws.deserializeAttachment(); } catch { return null; }
  }

  broadcast(obj, exclude) {
    const payload = JSON.stringify(obj);
    for (const s of this.sockets(exclude)) {
      if (this.info(s)?.banned) continue;
      try { s.send(payload); } catch {}
    }
  }

  // 실제 접속자 + 유령 접속자를 섞어서 보냄 (누가 진짜인지 구분 안 되게)
  async broadcastPresence(exclude) {
    const live = this.sockets(exclude).filter((s) => !this.info(s)?.banned);
    const real = live.map((s) => this.info(s)?.nick).filter(Boolean);
    const users = [...new Set([...real, ...ghosts()])].sort((a, b) => sortKey(a) - sortKey(b));
    for (const s of live) {
      try { s.send(JSON.stringify({ type: "presence", users, me: this.info(s)?.nick })); } catch {}
    }
  }
}
