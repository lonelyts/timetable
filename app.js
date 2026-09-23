/* =========================================================
   我的课表 · 主程序（金皓天 · 2026-2027 学年第 1 学期）
   纯原生 JavaScript，无任何依赖。
   数据保存在浏览器 localStorage：换设备用「设置 → 导出/导入」搬运。
   ========================================================= */
(function () {
  "use strict";

  /* ============ 1. 基础配置（想改时间就改这里） ============ */

  const STORAGE_KEY = "my-timetable-v2";

  // 浙江工商大学 下沙校区 上课时间表（每节课 45 分钟）
  const SLOTS = [
    { start: "08:05", end: "08:50" }, // 第 1 节
    { start: "08:50", end: "09:35" }, // 第 2 节
    { start: "09:50", end: "10:35" }, // 第 3 节
    { start: "10:40", end: "11:25" }, // 第 4 节
    { start: "11:30", end: "12:15" }, // 第 5 节
    { start: "13:40", end: "14:25" }, // 第 6 节
    { start: "14:35", end: "15:20" }, // 第 7 节
    { start: "15:30", end: "16:15" }, // 第 8 节
    { start: "16:25", end: "17:10" }, // 第 9 节
    { start: "18:30", end: "19:15" }, // 第 10 节
    { start: "19:25", end: "20:10" }, // 第 11 节
    { start: "20:20", end: "21:05" }, // 第 12 节
  ];
  const BANDS = [
    { name: "上午", from: 1, to: 5 },
    { name: "下午", from: 6, to: 9 },
    { name: "晚上", from: 10, to: 12 },
  ];

  const DAY_CN = ["一", "二", "三", "四", "五", "六", "日"];

  // 主题色预设：[主色, 渐变辅色]
  const PRESETS = [
    { name: "蜜桃橙", a: "#f4a259", b: "#f0819f" },
    { name: "薰衣草", a: "#9b8cff", b: "#79c0f0" },
    { name: "抹茶绿", a: "#6fbf9b", b: "#9ed07a" },
    { name: "樱花粉", a: "#f0819f", b: "#b98cf0" },
    { name: "雾霾蓝", a: "#7fa6e8", b: "#8fd0d8" },
    { name: "焦糖棕", a: "#c98a53", b: "#e0a86a" },
  ];

  /* 我的课表：按教务系统打印稿录入。
     weeks = [[起始周, 结束周], ...]；kind：theory 理论◆ / lab 实验◇ / practice 实习● / labor 劳动 */
  const MY_COURSES = [
    // ---- 星期一 ----
    { name: "应用技术", teacher: "叶天语", room: "E101", day: 1, slot: 2, span: 4, weeks: [[9, 11]], tone: 1 },
    { name: "电路与装置", teacher: "张战军", room: "E101", day: 1, slot: 2, span: 4, weeks: [[14, 15]], tone: 2 },
    { name: "应用技术", teacher: "叶天语", room: "E101", day: 1, slot: 3, span: 3, weeks: [[12, 13]], tone: 1 },
    { name: "应用技术", teacher: "叶天语", room: "E201", day: 1, slot: 6, span: 3, weeks: [[11, 12]], tone: 1 },
    { name: "应用技术", teacher: "叶天语", room: "E201", day: 1, slot: 6, span: 4, weeks: [[9, 10]], tone: 1 },
    { name: "电路与装置", teacher: "张战军", room: "E201", day: 1, slot: 6, span: 4, weeks: [[13, 15]], tone: 2 },
    { name: "应用技术", short: "应用技术实验", teacher: "陆忠祥", room: "萨塞克斯315", day: 1, slot: 10, span: 3, weeks: [[9, 9], [12, 13]], kind: "lab", tone: 1 },

    // ---- 星期二 ----
    { name: "中级羽毛球", teacher: "周卉", room: "体育中心一楼羽毛球馆2号门", day: 2, slot: 1, span: 2, weeks: [[1, 16]], tone: 3 },
    { name: "马克思主义基本原理", short: "马原", teacher: "潘惠香", room: "E306", day: 2, slot: 3, span: 3, weeks: [[1, 16]], tone: 4 },
    { name: "电路与装置", short: "电路与装置实验", teacher: "汪亚伦", room: "萨塞克斯301", day: 2, slot: 6, span: 3, weeks: [[11, 14]], kind: "lab", tone: 2 },
    { name: "电路与装置", teacher: "张战军", room: "待定", day: 2, slot: 10, span: 3, weeks: [[10, 11]], tone: 2 },

    // ---- 星期三 ----
    { name: "电路与装置", teacher: "张战军", room: "A201", day: 3, slot: 2, span: 4, weeks: [[14, 15]], tone: 2 },
    { name: "应用技术", teacher: "叶天语", room: "A201", day: 3, slot: 3, span: 3, weeks: [[9, 13]], tone: 1 },
    { name: "形势与政策(6)", short: "形势与政策", teacher: "历晶晶", room: "E201", day: 3, slot: 10, span: 3, weeks: [[5, 7]], tone: 6 },
    { name: "应用技术", teacher: "叶天语", room: "A201", day: 3, slot: 10, span: 3, weeks: [[8, 8]], tone: 1 },
    { name: "电路与装置", teacher: "张战军", room: "A201", day: 3, slot: 10, span: 3, weeks: [[10, 11]], tone: 2 },

    // ---- 星期四 ----
    {
      name: "毛泽东思想和中国特色社会主义理论体系概论",
      short: "毛概",
      teacher: "夏金梅",
      room: "E307",
      day: 4,
      slot: 1,
      span: 2,
      weeks: [[1, 16]],
      tone: 5,
    },
    { name: "工程学术英语1", short: "工程英语", teacher: "阮芳娟", room: "C403", day: 4, slot: 3, span: 2, weeks: [[5, 14]], tone: 6 },
    { name: "电路与装置", teacher: "张战军", room: "A201", day: 4, slot: 6, span: 4, weeks: [[13, 15]], tone: 2 },

    // ---- 星期五 ----
    { name: "大学生职业发展规划", short: "职业发展规划", teacher: "洪涛", room: "F229", day: 5, slot: 1, span: 2, weeks: [[1, 8]], tone: 3 },
    { name: "工程数学1A", teacher: "徐静", room: "D212", day: 5, slot: 3, span: 3, weeks: [[1, 16]], tone: 4 },
    { name: "创业基础实训(理)", short: "创业实训", teacher: "刘宇慧", room: "F225", day: 5, slot: 6, span: 2, weeks: [[9, 16]], tone: 5 },
  ];

  const ICON_SETTINGS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.5-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.6a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.7 1.5l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.6 1z"></path></svg>';
  const ICON_SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"></path></svg>';
  const ICON_CHEVRON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>';

  /* ============ 2. 小工具函数 ============ */

  const $ = (id) => document.getElementById(id);
  const pad2 = (n) => String(n).padStart(2, "0");
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => {
    const x = startOfDay(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const mondayOf = (d) => addDays(d, -((startOfDay(d).getDay() + 6) % 7));
  const dayDiff = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
  const ymd = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  const parseYmd = (s) => {
    const [y, m, d] = String(s).split("-").map(Number);
    return new Date(y || 2026, (m || 1) - 1, d || 1);
  };
  const weekdayOf = (d) => ((d.getDay() + 6) % 7) + 1; // 周一=1 … 周日=7
  const toMin = (hhmm2) => {
    const [h, m] = String(hhmm2).split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const nowMinutes = () => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  };
  const hhmm = (mins) => pad2(Math.floor(mins / 60)) + ":" + pad2(mins % 60);
  const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // 动画开关（渲染时由 render() 更新）
  const appEl = document.querySelector(".app");
  const anim = { on: false, stagger: false, weekSlide: "" };

  // 重新播放一次进场动画
  function playEnter(el, dir) {
    el.removeAttribute("data-enter");
    void el.offsetWidth;
    el.setAttribute("data-enter", dir > 0 ? "next" : dir < 0 ? "prev" : "fade");
  }

  // 调整色相，用来给自定义主题色生成渐变辅色
  function shiftHue(hex, deg) {
    const m = /^#?([\da-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const num = parseInt(m[1], 16);
    let r = ((num >> 16) & 255) / 255;
    let g = ((num >> 8) & 255) / 255;
    let b = (num & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const l = (max + min) / 2;
    const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
    if (max !== min) {
      if (max === r) h = 60 * (((g - b) / (max - min)) % 6);
      else if (max === g) h = 60 * ((b - r) / (max - min) + 2);
      else h = 60 * ((r - g) / (max - min) + 4);
    }
    h = (h + deg + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const mm = l - c / 2;
    const seg = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
    r = Math.round((seg[0] + mm) * 255);
    g = Math.round((seg[1] + mm) * 255);
    b = Math.round((seg[2] + mm) * 255);
    return "#" + [r, g, b].map((v) => pad2(clamp(v, 0, 255).toString(16))).join("");
  }

  /* ============ 3. 数据读写 ============ */

  function defaultData() {
    return {
      meta: {
        semesterStart: "2026-09-14", // 本学期 9 月 14 日（周一）正式上课 = 第 1 周
        totalWeeks: 16,
        showSaturday: false,
        showSunday: false,
        theme: "auto",
        accent: PRESETS[0].a,
        accent2: PRESETS[0].b,
      },
      courses: MY_COURSES.map((c, i) => Object.assign({ id: "c" + (i + 1), span: 1, parity: "all" }, c)),
    };
  }

  function normalizeWeeks(raw, fallbackTo) {
    const list = Array.isArray(raw) && raw.length ? raw : null;
    if (!list) return [[1, fallbackTo]];
    return list
      .map((pair) => {
        const arr = Array.isArray(pair) ? pair : [pair, pair];
        const a = clamp(Number(arr[0]) || 1, 1, 40);
        const b = clamp(Number(arr[1]) || a, a, 40);
        return [a, b];
      })
      .filter(Boolean);
  }

  function normalize(raw) {
    const base = defaultData();
    const src = raw && typeof raw === "object" ? raw : {};
    const meta = Object.assign({}, base.meta, src.meta || {});
    const courses = (Array.isArray(src.courses) ? src.courses : base.courses).map((c, i) => ({
      id: c.id || "c" + i + uid(),
      name: String(c.name || "未命名课程"),
      short: c.short ? String(c.short) : "",
      teacher: String(c.teacher || ""),
      room: String(c.room || ""),
      day: clamp(Number(c.day) || 1, 1, 7),
      slot: clamp(Number(c.slot) || 1, 1, SLOTS.length),
      span: clamp(Number(c.span) || 1, 1, 4),
      tone: clamp(Number(c.tone) || 1, 1, 6),
      kind: ["theory", "lab", "practice", "labor"].indexOf(c.kind) >= 0 ? c.kind : "theory",
      weeks: normalizeWeeks(c.weeks, meta.totalWeeks),
      parity: ["all", "odd", "even"].indexOf(c.parity) >= 0 ? c.parity : "all",
    }));
    return { meta, courses };
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : defaultData();
    } catch (err) {
      return defaultData();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      toast("浏览器禁止本地存储，本次改动不会被保存");
    }
  }

  let data = loadData();
  const ui = { view: "today", weekOffset: 0, sheetCourseId: null };

  /* ============ 4. 排课相关计算 ============ */

  const courseRange = (c) => ({
    start: SLOTS[c.slot - 1].start,
    end: SLOTS[clamp(c.slot + c.span - 2, 0, SLOTS.length - 1)].end,
    from: c.slot,
    to: clamp(c.slot + c.span - 1, 1, SLOTS.length),
  });

  function weekOf(date) {
    return Math.floor(dayDiff(mondayOf(parseYmd(data.meta.semesterStart)), mondayOf(date)) / 7) + 1;
  }

  function weeksLabel(c) {
    return (
      c.weeks.map(([a, b]) => (a === b ? a + "周" : a + "-" + b + "周")).join("、") +
      (c.parity === "odd" ? " 单周" : c.parity === "even" ? " 双周" : "")
    );
  }

  function matchWeek(c, week) {
    const inRange = c.weeks.some(([a, b]) => week >= a && week <= b);
    if (!inRange) return false;
    if (c.parity === "odd") return week % 2 === 1;
    if (c.parity === "even") return week % 2 === 0;
    return true;
  }

  function coursesFor(day, week) {
    return data.courses
      .filter((c) => c.day === day && matchWeek(c, week))
      .sort((a, b) => a.slot - b.slot);
  }

  function dayColumns() {
    const days = [1, 2, 3, 4, 5];
    if (data.meta.showSaturday) days.push(6);
    if (data.meta.showSunday) days.push(7);
    return days;
  }

  // 当前时间在「节次网格」里的位置（单位：节），用来画那条红线
  function nowRatio() {
    const mins = nowMinutes();
    for (let i = 0; i < SLOTS.length; i += 1) {
      const s = toMin(SLOTS[i].start);
      const e = toMin(SLOTS[i].end);
      if (mins < s) return i / SLOTS.length;
      if (mins <= e) return (i + (mins - s) / (e - s)) / SLOTS.length;
    }
    return 1;
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return "早上好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  };

  const fmtMD = (d) => d.getMonth() + 1 + "月" + d.getDate() + "日";
  const kindMark = (c) => (c.kind === "lab" ? "◇ " : c.kind === "practice" ? "● " : c.kind === "labor" ? "◌ " : "");

  /* ============ 5. 主题与顶栏 ============ */

  function applyTheme() {
    const theme = data.meta.theme || "auto";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty("--accent", data.meta.accent);
    document.documentElement.style.setProperty("--accent-2", data.meta.accent2);
    document.documentElement.style.setProperty("--now", shiftHue(data.meta.accent, -18));
    // 手机状态栏颜色跟着主题走
    const dark =
      theme === "dark" ||
      (theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#16130f" : "#fffaf0");
  }

  function renderAppBar() {
    const now = new Date();
    const week = weekOf(now);
    const bar = $("appbar");

    if (ui.view === "today") {
      bar.innerHTML =
        "<div><h1>" + greeting() + "，皓天</h1>" +
        '<div class="sub">' + fmtMD(now) + " 星期" + DAY_CN[weekdayOf(now) - 1] + " · 第 " + week + " 周</div></div>" +
        '<button type="button" class="iconbtn" data-action="go" data-view="settings" aria-label="设置">' + ICON_SETTINGS + "</button>";
      return;
    }
    if (ui.view === "week") {
      bar.innerHTML =
        '<div><h1>课表</h1><div class="sub">学期第 ' + (week + ui.weekOffset) + " 周 · 共 " +
        data.courses.length + " 条排课</div></div>" +
        '<button type="button" class="iconbtn" data-action="go" data-view="today" aria-label="回到今日">' + ICON_SUN + "</button>";
      return;
    }
    bar.innerHTML =
      '<div><h1>设置</h1><div class="sub">配色、学期与数据</div></div>' +
      '<button type="button" class="iconbtn" data-action="go" data-view="today" aria-label="回到今日">' + ICON_CHEVRON + "</button>";
  }

  /* ============ 6. 渲染：今日 ============ */

  function renderToday() {
    const now = new Date();
    const week = weekOf(now);
    const today = weekdayOf(now);
    const mins = nowMinutes();
    const list = coursesFor(today, week).map((c) => ({ c, r: courseRange(c) }));

    const current = list.find((x) => mins >= toMin(x.r.start) && mins < toMin(x.r.end));
    const upcoming = list.filter((x) => toMin(x.r.start) > mins);
    const done = list.filter((x) => toMin(x.r.end) <= mins);
    const heroCourse = current || upcoming[0];
    const rest = current ? upcoming : upcoming.slice(1);

    let html = "";

    if (heroCourse) {
      const { c, r } = heroCourse;
      const total = toMin(r.end) - toMin(r.start);
      const passed = clamp(mins - toMin(r.start), 0, total);
      const wait = Math.max(0, toMin(r.start) - mins);
      const pill = current
        ? "正在上课 · 还剩 " + (total - passed) + " 分钟"
        : wait >= 60
        ? "下一节 · " + Math.floor(wait / 60) + " 小时 " + (wait % 60) + " 分钟后"
        : "下一节 · " + wait + " 分钟后";
      html +=
        '<section class="hero' + (c.kind === "lab" ? " is-lab" : "") + '" data-tone="' + c.tone + '">' +
        '<span class="pill">' + pill + "</span>" +
        "<h2>" + esc(c.name) + "</h2>" +
        '<div class="meta">' +
        [c.room, c.teacher].filter(Boolean).map(esc).join(" · ") +
        " · 第 " + r.from + "-" + r.to + " 节 " + r.start + " – " + r.end +
        "</div>" +
        (current
          ? '<div class="bar"><i style="width:' + Math.round((passed / total) * 100) + '%"></i></div>' +
            '<div class="note">已上 ' + passed + " 分钟 / 共 " + total + " 分钟 · " + weeksLabel(c) + "</div>"
          : '<div class="note">' + weeksLabel(c) + "</div>") +
        "</section>";
    } else {
      const allDone = list.length > 0;
      html +=
        '<section class="hero is-free">' +
        '<span class="pill">' + (allDone ? "今天的课上完啦" : "今天没有课") + "</span>" +
        "<h2>" + (allDone ? "收工，好好休息 🎉" : "自由的今天 🌿") + "</h2>" +
        '<div class="meta">' + (allDone ? "去操场走走，或者把作业清一清" : "去「课表」页，点一下空白格子就能加课") + "</div></section>";
    }

    if (rest.length || done.length) {
      html +=
        '<div class="section-title"><b>' + (current ? "接下来" : "今天的课") + "</b><span>共 " + list.length + " 节</span></div>" +
        '<div class="list">';
      rest.forEach((x, i) => {
        html +=
          '<div class="row" data-tone="' + x.c.tone + '" style="--i:' + i + '">' +
          '<div class="time">' + x.r.start + "<span>" + x.r.end + "</span></div>" +
          '<div class="body"><span class="name">' + kindMark(x.c) + esc(x.c.short || x.c.name) + "</span>" +
          '<span class="sub">' + [x.c.room, x.c.teacher].filter(Boolean).map(esc).join(" · ") +
          " · 第 " + x.r.from + "-" + x.r.to + " 节</span></div></div>";
      });
      done.forEach((x, i) => {
        html +=
          '<div class="row is-done" data-tone="' + x.c.tone + '" style="--i:' + (i + rest.length) + '">' +
          '<div class="time">' + x.r.start + "<span>" + x.r.end + "</span></div>" +
          '<div class="body"><span class="name">' + kindMark(x.c) + esc(x.c.short || x.c.name) + "</span>" +
          '<span class="sub">已结束' + (x.c.room ? " · " + esc(x.c.room) : "") + "</span></div></div>";
      });
      html += "</div>";
    }

    if (!list.length) {
      html +=
        '<div class="empty"><div class="face">🌿</div><div>今天没有安排课程</div>' +
        "<div>去「课表」页，点一下空白格子就能加课</div></div>";
    } else {
      const firstRange = courseRange(list[0].c);
      const lastRange = courseRange(list[list.length - 1].c);
      html +=
        '<div class="summary">今天共 ' + list.length + " 节 · " + firstRange.start + " 开始，" + lastRange.end + " 结束" +
        (done.length ? " · 已完成 " + done.length + " 节" : "") + "</div>";
    }

    const tomorrow = coursesFor((today % 7) + 1, week);
    if (tomorrow.length) {
      const tomorrowBase = rest.length + done.length;
      html +=
        '<div class="section-title"><b>明天</b><span>' + tomorrow.length + " 节课</span></div>" +
        '<div class="list">' +
        tomorrow
          .map((c, i) => {
            const r = courseRange(c);
            return (
              '<div class="row" data-tone="' + c.tone + '" style="--i:' + (i + tomorrowBase) + '"><div class="time">' + r.start + "<span>" + r.end + "</span></div>" +
              '<div class="body"><span class="name">' + kindMark(c) + esc(c.short || c.name) + "</span>" +
              '<span class="sub">' + [c.room, c.teacher].filter(Boolean).map(esc).join(" · ") +
              " · 第 " + r.from + "-" + r.to + " 节</span></div></div>"
            );
          })
          .join("") +
        "</div>";
    }

    $("view-today").innerHTML = html;
  }

  /* ============ 7. 渲染：课表 ============ */

  function renderWeek() {
    const monday = addDays(mondayOf(new Date()), ui.weekOffset * 7);
    const week = weekOf(new Date()) + ui.weekOffset;
    const days = dayColumns();
    const todayWd = weekdayOf(new Date());

    let head = '<span style="grid-row:1;grid-column:1"></span>';
    days.forEach((day, di) => {
      const date = addDays(monday, day - 1);
      const isToday = ui.weekOffset === 0 && day === todayWd;
      head +=
        '<span class="wk-day' + (isToday ? " is-today" : "") + '" style="grid-row:1;grid-column:' + (di + 2) + '">' +
        "<b>" + DAY_CN[day - 1] + "</b><span>" + date.getDate() + "</span></span>";
    });

    let body = "";
    SLOTS.forEach((slot, si) => {
      const band = BANDS.filter((b) => b.from === si + 1)[0];
      body +=
        '<div class="wk-time' + (band ? " has-band" : "") + '" style="grid-row:' + (si + 2) + ';grid-column:1">' +
        "<b>" + (si + 1) + "</b><span>" + slot.start + "</span></div>";
      days.forEach((day, di) => {
        body +=
          '<button type="button" class="cell" data-action="add" data-day="' + day + '" data-slot="' + (si + 1) +
          '" style="grid-row:' + (si + 2) + ";grid-column:" + (di + 2) + '" aria-label="星期' + DAY_CN[day - 1] +
          " 第 " + (si + 1) + ' 节 添加课程"></button>';
      });
    });

    let blocks = "";
    // 先按「从上到下、从左到右」排好队，浮入时才会像一条波浪
    const laid = [];
    days.forEach((day, di) => {
      coursesFor(day, week).forEach((c) => laid.push({ c, di }));
    });
    laid.sort((a, b) => a.c.slot - b.c.slot || a.di - b.di);

    laid.forEach((item, order) => {
      const c = item.c;
      const di = item.di;
      const r = courseRange(c);
      const isNow =
        ui.weekOffset === 0 && c.day === todayWd && nowMinutes() >= toMin(r.start) && nowMinutes() < toMin(r.end);
      const sub = [c.room, c.teacher].filter(Boolean).join(" · ");
      const fullTerm = c.weeks.length === 1 && c.weeks[0][0] === 1 && c.weeks[0][1] >= data.meta.totalWeeks;
      blocks +=
        '<button type="button" class="blk' + (isNow ? " is-now" : "") + (c.kind === "lab" ? " is-lab" : "") +
        '" data-tone="' + c.tone + '"' +
        ' style="--row:' + (c.slot + 1) + ";--span:" + c.span + ";--col:" + (di + 2) + ";--i:" + order + '"' +
        ' data-action="open" data-id="' + c.id + '" aria-label="' + esc(c.name) + " " + weeksLabel(c) + '">' +
        '<span class="blk-name">' + kindMark(c) + esc(c.short || c.name) + "</span>" +
        '<span class="blk-sub">' + esc(sub) + "</span>" +
        (fullTerm && c.parity === "all" ? "" : '<span class="blk-week">' + weeksLabel(c) + "</span>") +
        "</button>";
    });
    const count = laid.length;

    const firstStart = toMin(SLOTS[0].start);
    const lastEnd = toMin(SLOTS[SLOTS.length - 1].end);
    const showNow = ui.weekOffset === 0 && nowMinutes() > firstStart - 90 && nowMinutes() < lastEnd + 90;
    const nowLine = showNow
      ? '<div class="nowline" style="top:calc(34px + (100% - 34px) * ' + nowRatio().toFixed(4) +
        ');transform:translateY(-50%)"><i></i><u></u><span>' + hhmm(nowMinutes()) + "</span></div>"
      : "";

    const title =
      ui.weekOffset === 0 ? "本周" : ui.weekOffset < 0 ? "往前看 " + -ui.weekOffset + " 周" : "往后看 " + ui.weekOffset + " 周";

    $("view-week").innerHTML =
      '<div class="week-nav">' +
      '<button type="button" data-action="week" data-delta="-1" aria-label="上一周">‹</button>' +
      '<button type="button" class="week-title-btn" data-action="week-today" title="回到本周">' +
      '<span class="week-title">第 ' + week + " 周<span>" + fmtMD(monday) + " – " +
      fmtMD(addDays(monday, days[days.length - 1] - 1)) + "</span></span></button>" +
      '<span style="display:flex;gap:6px">' +
      '<button type="button" data-action="week" data-delta="1" aria-label="下一周">›</button>' +
      '<button type="button" data-action="add" data-day="' + todayWd + '" data-slot="1" aria-label="添加课程">＋</button>' +
      "</span></div>" +
      '<div class="week-grid" data-slide="' + anim.weekSlide + '" style="--days:' + days.length +
      ";--slots:" + SLOTS.length + '">' +
      head + body + blocks + nowLine + "</div>" +
      '<div class="week-hint">' + title + "共 " + count + " 节课 · 点空白格加课，点课程可编辑</div>";
  }

  /* ============ 8. 渲染：设置 ============ */

  function renderSettings() {
    const m = data.meta;
    const isPreset = (p) => p.a.toLowerCase() === String(m.accent).toLowerCase();
    const labCount = data.courses.filter((c) => c.kind === "lab").length;

    $("view-settings").innerHTML =
      '<div class="group"><h2>学期</h2>' +
      '<div class="field"><span>第 1 周周一<span class="hint">决定「现在是第几周」</span></span>' +
      '<input type="date" data-set="semesterStart" value="' + m.semesterStart + '"></div>' +
      '<div class="field"><span>学期总周数</span>' +
      '<input type="number" min="1" max="30" style="width:78px" data-set="totalWeeks" value="' + m.totalWeeks + '"></div>' +
      '<div class="field"><span>现在是</span><span>第 ' + weekOf(new Date()) + " 周</span></div></div>" +

      '<div class="group"><h2>显示</h2>' +
      '<div class="field"><span>显示周六</span><label class="switch"><input type="checkbox" data-set="showSaturday"' +
      (m.showSaturday ? " checked" : "") + "><i></i></label></div>" +
      '<div class="field"><span>显示周日</span><label class="switch"><input type="checkbox" data-set="showSunday"' +
      (m.showSunday ? " checked" : "") + "><i></i></label></div>" +
      '<div class="field"><span>深色模式</span><select data-set="theme">' +
      ["auto", "light", "dark"]
        .map(
          (v) =>
            '<option value="' + v + '"' + (m.theme === v ? " selected" : "") + ">" +
            { auto: "跟随系统", light: "浅色", dark: "深色" }[v] + "</option>"
        )
        .join("") +
      "</select></div></div>" +

      '<div class="group"><h2>主题色</h2>' +
      '<div class="swatches">' +
      PRESETS.map(
        (p) =>
          '<button type="button" class="swatch" style="--c:linear-gradient(135deg,' + p.a + "," + p.b + ')"' +
          ' data-action="accent" data-a="' + p.a + '" data-b="' + p.b + '" title="' + p.name + '"' +
          ' aria-pressed="' + (isPreset(p) ? "true" : "false") + '"></button>'
      ).join("") +
      "</div>" +
      '<div class="field"><span>自定义颜色</span><input type="color" data-set="accentColor" value="' + m.accent + '"></div>' +
      "</div>" +

      '<div class="group"><h2>课表数据</h2>' +
      '<div class="field"><span>排课条数</span><span>' + data.courses.length + " 条（含 " + labCount + " 个实验）</span></div>" +
      '<div class="btn-row" style="padding:4px 0 10px">' +
      '<button type="button" class="btn" data-action="export">导出备份</button>' +
      '<button type="button" class="btn" data-action="import">导入备份</button>' +
      "</div>" +
      '<button type="button" class="btn" data-action="reset-sample">恢复我的课表</button>' +
      '<button type="button" class="btn btn-danger" data-action="clear-all">清空所有课程</button>' +
      "</div>" +

      '<div class="about">我的课表 · 金皓天 2026-2027-1<br>节次时间：浙江工商大学下沙校区上课时间表<br>' +
      "数据只存在这台设备的浏览器里，记得偶尔导出备份</div>";
  }

  /* ============ 9. 渲染总入口 ============ */

  const VIEW_ORDER = { today: 0, week: 1, settings: 2 };

  /* opts:
     animate   —— 是否播放动画（每分钟自动刷新时传 false，避免闪）
     viewChanged / weekChanged / dir —— 切页、翻周及其方向 */
  function render(opts) {
    const o = opts || {};
    const animate = o.animate !== false;
    const viewChanged = Boolean(o.viewChanged);
    const weekChanged = Boolean(o.weekChanged);
    const dir = Number(o.dir) || 0;

    anim.on = animate;
    anim.stagger = animate && !weekChanged;
    anim.weekSlide = animate && weekChanged ? (dir > 0 ? "next" : dir < 0 ? "prev" : "fade") : "";
    appEl.dataset.anim = animate ? "on" : "off";
    appEl.dataset.stagger = anim.stagger ? "on" : "off";

    applyTheme();
    renderAppBar();
    ["today", "week", "settings"].forEach((v) => {
      $("view-" + v).hidden = v !== ui.view;
    });
    $("view-week").classList.toggle("view--fill", ui.view === "week");
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.view === ui.view);
    });
    if (ui.view === "today") renderToday();
    if (ui.view === "week") renderWeek();
    if (ui.view === "settings") renderSettings();

    if (animate && (viewChanged || o.first)) {
      playEnter($("view-" + ui.view), viewChanged ? dir : 0);
    }
  }

  // 切页时统一算一个方向：往后走的页面从右边进来
  function goView(view) {
    if (view === ui.view) return;
    const dir = (VIEW_ORDER[view] || 0) - (VIEW_ORDER[ui.view] || 0);
    ui.view = view;
    render({ viewChanged: true, dir });
  }

  /* ============ 10. 弹层：课程详情 / 编辑 ============ */

  function openSheet(course, preset) {
    const c =
      course ||
      Object.assign(
        {
          id: "",
          name: "",
          short: "",
          teacher: "",
          room: "",
          day: 1,
          slot: 1,
          span: 1,
          tone: 1,
          kind: "theory",
          weeks: [[1, data.meta.totalWeeks]],
          parity: "all",
        },
        preset || {}
      );
    ui.sheetCourseId = course ? c.id : null;
    const wk = c.weeks[0] || [1, data.meta.totalWeeks];
    const opts = (list, value) =>
      list.map((item) => '<option value="' + item[0] + '"' + (String(value) === String(item[0]) ? " selected" : "") + ">" + item[1] + "</option>").join("");

    $("sheet").innerHTML =
      '<div class="sheet-head"><h2>' + (course ? "编辑课程" : "添加课程") + "</h2>" +
      '<button type="button" data-action="close-sheet" aria-label="关闭">×</button></div>' +
      '<form class="form" id="course-form">' +
      '<label>课程名称<input type="text" name="name" required value="' + esc(c.name) + '" placeholder="例如：数据结构"></label>' +
      '<div class="two">' +
      '<label>教师<input type="text" name="teacher" value="' + esc(c.teacher) + '" placeholder="选填"></label>' +
      '<label>教室<input type="text" name="room" value="' + esc(c.room) + '" placeholder="选填"></label>' +
      "</div>" +
      '<label>课表里的简称<input type="text" name="short" value="' + esc(c.short) + '" placeholder="选填，留空就用全名"></label>' +
      '<div class="three">' +
      "<label>星期<select name=\"day\">" +
      opts([1, 2, 3, 4, 5, 6, 7].map((d) => [d, "周" + DAY_CN[d - 1]]), c.day) +
      "</select></label>" +
      '<label>起始节<select name="slot">' +
      opts(SLOTS.map((s, i) => [i + 1, "第 " + (i + 1) + " 节"]), c.slot) +
      "</select></label>" +
      '<label>连上<select name="span">' +
      opts([1, 2, 3, 4].map((n) => [n, n + " 节"]), c.span) +
      "</select></label></div>" +
      '<div class="three">' +
      '<label>起始周<input type="number" name="from" min="1" max="30" value="' + wk[0] + '"></label>' +
      '<label>结束周<input type="number" name="to" min="1" max="30" value="' + wk[1] + '"></label>' +
      '<label>单双周<select name="parity">' +
      opts([["all", "每周"], ["odd", "单周"], ["even", "双周"]], c.parity) +
      "</select></label></div>" +
      '<label>类型<select name="kind">' +
      opts([["theory", "理论 ◆"], ["lab", "实验 ◇"], ["practice", "实习 ●"], ["labor", "劳动"]], c.kind) +
      "</select></label>" +
      '<label>颜色<div class="tone-picker">' +
      [1, 2, 3, 4, 5, 6]
        .map((t) => '<button type="button" data-tone="' + t + '" data-action="pick-tone" aria-pressed="' + (c.tone === t) + '"></button>')
        .join("") +
      "</div></label>" +
      '<input type="hidden" name="tone" value="' + c.tone + '">' +
      '<div class="actions">' +
      '<button type="submit" class="btn btn-primary">保存</button>' +
      (course ? '<button type="button" class="btn btn-danger" data-action="delete-course">删除这节课</button>' : "") +
      "</div></form>";

    clearTimeout(sheetCloseTimer);
    $("sheet").classList.remove("is-closing");
    $("sheet-mask").classList.remove("is-closing");
    $("sheet").hidden = false;
    $("sheet-mask").hidden = false;
    const nameInput = $("sheet").querySelector("input[name=name]");
    if (nameInput) nameInput.focus();
  }

  let sheetCloseTimer = null;
  function closeSheet() {
    const sheet = $("sheet");
    const mask = $("sheet-mask");
    ui.sheetCourseId = null;
    clearTimeout(sheetCloseTimer);
    if (sheet.hidden) return;
    // 先播下滑动画，再真正隐藏
    sheet.classList.add("is-closing");
    mask.classList.add("is-closing");
    sheetCloseTimer = setTimeout(() => {
      sheet.hidden = true;
      mask.hidden = true;
      sheet.classList.remove("is-closing");
      mask.classList.remove("is-closing");
      sheet.innerHTML = "";
    }, 200);
  }

  function submitSheet(form) {
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    if (!name) {
      toast("先给课程起个名字吧");
      return;
    }
    const slot = clamp(Number(fd.get("slot")) || 1, 1, SLOTS.length);
    const span = clamp(Number(fd.get("span")) || 1, 1, SLOTS.length - slot + 1);
    const from = clamp(Number(fd.get("from")) || 1, 1, 40);
    const to = clamp(Number(fd.get("to")) || from, from, 40);
    const payload = {
      name,
      short: String(fd.get("short") || "").trim(),
      teacher: String(fd.get("teacher") || "").trim(),
      room: String(fd.get("room") || "").trim(),
      day: Number(fd.get("day")),
      slot,
      span,
      tone: Number(fd.get("tone")),
      kind: String(fd.get("kind") || "theory"),
      weeks: [[from, to]],
      parity: String(fd.get("parity") || "all"),
    };

    if (ui.sheetCourseId) {
      Object.assign(data.courses.filter((c) => c.id === ui.sheetCourseId)[0], payload);
      toast("已保存");
    } else {
      data.courses.push(Object.assign({ id: uid() }, payload));
      toast("已添加「" + name + "」");
    }
    saveData();
    closeSheet();
    render();
  }

  /* ============ 11. 提示条 ============ */

  let toastTimer = null;
  let toastHideTimer = null;
  function toast(text) {
    const el = $("toast");
    el.textContent = text;
    clearTimeout(toastTimer);
    clearTimeout(toastHideTimer);
    el.classList.remove("is-hiding");
    el.hidden = false;
    toastTimer = setTimeout(() => {
      el.classList.add("is-hiding");
      toastHideTimer = setTimeout(() => {
        el.hidden = true;
        el.classList.remove("is-hiding");
      }, 180);
    }, 1700);
  }

  /* ============ 12. 交互 ============ */

  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (el) {
      const action = el.dataset.action;
      if (action === "go") {
        goView(el.dataset.view);
      } else if (action === "week") {
        const delta = Number(el.dataset.delta);
        ui.weekOffset += delta;
        render({ weekChanged: true, dir: delta });
      } else if (action === "week-today") {
        const dir = ui.weekOffset > 0 ? -1 : 1;
        const moved = ui.weekOffset !== 0;
        ui.weekOffset = 0;
        render({ weekChanged: moved, dir });
      } else if (action === "add") {
        openSheet(null, { day: Number(el.dataset.day), slot: Number(el.dataset.slot) });
      } else if (action === "open") {
        const course = data.courses.filter((c) => c.id === el.dataset.id)[0];
        if (course) openSheet(course);
      } else if (action === "close-sheet") {
        closeSheet();
      } else if (action === "pick-tone") {
        const form = el.closest("form");
        form.querySelector("input[name=tone]").value = el.dataset.tone;
        form.querySelectorAll("[data-action=pick-tone]").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
      } else if (action === "delete-course") {
        if (window.confirm("确定删除这节课吗？")) {
          data.courses = data.courses.filter((c) => c.id !== ui.sheetCourseId);
          saveData();
          closeSheet();
          render({ animate: false });
          toast("已删除");
        }
      } else if (action === "accent") {
        data.meta.accent = el.dataset.a;
        data.meta.accent2 = el.dataset.b;
        saveData();
        render({ animate: false });
      } else if (action === "export") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "我的课表备份-" + ymd(new Date()) + ".json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        toast("已导出备份文件");
      } else if (action === "import") {
        $("import-file").click();
      } else if (action === "reset-sample") {
        if (window.confirm("用教务系统的课表覆盖当前所有课程？")) {
          data = defaultData();
          saveData();
          render();
          toast("已恢复我的课表");
        }
      } else if (action === "clear-all") {
        if (window.confirm("确定清空所有课程吗？（可以先用「导出备份」留一份）")) {
          data.courses = [];
          saveData();
          render();
          toast("已清空，点课表空白格开始加课");
        }
      }
      return;
    }
    if (event.target.id === "sheet-mask") closeSheet();
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id === "course-form") {
      event.preventDefault();
      submitSheet(event.target);
    }
  });

  document.addEventListener("change", (event) => {
    const el = event.target.closest("[data-set]");
    if (!el) return;
    const key = el.dataset.set;
    if (key === "accentColor") {
      data.meta.accent = el.value;
      data.meta.accent2 = shiftHue(el.value, 45);
    } else if (el.type === "checkbox") {
      data.meta[key] = el.checked;
    } else if (el.type === "number") {
      data.meta[key] = clamp(Number(el.value) || 1, 1, 30);
    } else {
      data.meta[key] = el.value;
    }
    saveData();
    render({ animate: false });
  });

  $("import-file").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        data = normalize(JSON.parse(String(reader.result)));
        saveData();
        render();
        toast("已导入备份");
      } catch (err) {
        toast("这个文件读不出来，确认是导出的备份吗？");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      goView(tab.dataset.view);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheet();
  });

  // 每分钟刷新一次和「现在」有关的内容（弹层打开时不刷新，免得打断输入）
  setInterval(() => {
    if (!ui.sheetCourseId && $("sheet").hidden) render({ animate: false });
  }, 60000);

  // 手机上「添加到主屏幕」后离线也能用
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  render({ first: true });
})();
