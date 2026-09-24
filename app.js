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
        // 立绘壁纸设置（图片本身存在本地 IndexedDB，只有 key 记在这里）
        wall: {
          key: "",
          opacity: 0.85,
          blur: 0,
          align: "top",
          size: "contain",
          cutout: true,
          onToday: true,
          onWeek: true,
        },
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
    meta.wall = Object.assign({}, base.meta.wall, (src.meta && src.meta.wall) || {});
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

  /* ============ 3.5 立绘壁纸：图片只存本地（IndexedDB），不上传、不进仓库 ============ */

  const MEDIA_DB = "my-timetable-media";
  const media = {}; // key -> dataURL，内存缓存，渲染时同步取用

  function openMediaDB() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("no indexeddb"));
        return;
      }
      const req = indexedDB.open(MEDIA_DB, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("media")) req.result.createObjectStore("media");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function mediaPut(key, dataUrl) {
    media[key] = dataUrl; // 先放内存，界面立刻能用
    try {
      const db = await openMediaDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction("media", "readwrite");
        tx.objectStore("media").put(dataUrl, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      // 兜底：浏览器不支持 IndexedDB 时，试着塞进 localStorage（可能因太大失败）
      try {
        localStorage.setItem("media:" + key, dataUrl);
      } catch (err2) {
        toast("这台浏览器不让存大图，壁纸只在本次打开时有效");
      }
    }
  }

  async function mediaDel(key) {
    delete media[key];
    try {
      const db = await openMediaDB();
      await new Promise((resolve) => {
        const tx = db.transaction("media", "readwrite");
        tx.objectStore("media").delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      /* ignore */
    }
    try {
      localStorage.removeItem("media:" + key);
    } catch (err) {
      /* ignore */
    }
  }

  async function mediaLoadAll() {
    try {
      const db = await openMediaDB();
      await new Promise((resolve) => {
        const tx = db.transaction("media", "readonly");
        const store = tx.objectStore("media");
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            media[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve();
          }
        };
        req.onerror = () => resolve();
      });
    } catch (err) {
      /* 没有 IndexedDB 就看 localStorage 兜底 */
    }
    Object.keys(localStorage).forEach((k) => {
      if (k.indexOf("media:") === 0) {
        const key = k.slice(6);
        if (!media[key]) media[key] = localStorage.getItem(k) || "";
      }
    });
  }

  /* 去背景：从四条边往里泛洪，只删掉「和边缘连通、颜色接近背景」的区域。
     这样不管背景是白色还是浅黄/浅灰都能去掉，而人物身上的白色衣服不会被吃掉。 */
  function cutoutBackground(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const d = imageData.data;
    const at = (x, y) => (y * w + x) * 4;

    // 参考背景色 = 四个角的平均值
    const cs = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
    let r0 = 0;
    let g0 = 0;
    let b0 = 0;
    cs.forEach((i) => {
      r0 += d[i] / 4;
      g0 += d[i + 1] / 4;
      b0 += d[i + 2] / 4;
    });

    const globalTol = 56; // 和背景色的最大差异
    const localTol = 16; // 和"已经判定为背景的邻居"的最大差异（应对渐变背景）
    const dist = (i) => Math.sqrt((d[i] - r0) ** 2 + (d[i + 1] - g0) ** 2 + (d[i + 2] - b0) ** 2);

    const mark = new Uint8Array(w * h);
    const stack = [];
    const push = (x, y, fromX, fromY) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const p = y * w + x;
      if (mark[p]) return;
      const i = p * 4;
      const near = dist(i) <= globalTol;
      let local = false;
      if (!near && fromX >= 0) {
        const j = at(fromX, fromY);
        local =
          Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]) <= localTol * 3;
      }
      if (!near && !local) return;
      mark[p] = 1;
      stack.push(p);
    };

    for (let x = 0; x < w; x += 1) {
      push(x, 0, -1, -1);
      push(x, h - 1, -1, -1);
    }
    for (let y = 0; y < h; y += 1) {
      push(0, y, -1, -1);
      push(w - 1, y, -1, -1);
    }

    while (stack.length) {
      const p = stack.pop();
      const x = p % w;
      const y = (p - x) / w;
      push(x + 1, y, x, y);
      push(x - 1, y, x, y);
      push(x, y + 1, x, y);
      push(x, y - 1, x, y);
    }

    // 边缘羽化：背景区域按"离背景色多远"给一个软透明，边缘就不会有硬白边
    for (let p = 0; p < w * h; p += 1) {
      if (!mark[p]) continue;
      const i = p * 4;
      const a = Math.round(Math.min(255, Math.max(0, (dist(i) / globalTol) * 240)));
      if (a < d[i + 3]) d[i + 3] = a;
    }
  }

  function prepareWallpaper(file, doCutout) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1000;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          if (doCutout) {
            const data = ctx.getImageData(0, 0, w, h);
            cutoutBackground(data);
            ctx.putImageData(data, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } else {
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          }
        };
        img.onerror = reject;
        img.src = String(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function importWallpaper(file) {
    if (!file) return;
    toast("正在处理图片…");
    try {
      // 同时处理两份：原图版（保留背景）+ 去背景版，之后开关一拨就能切换
      const base = "wall-" + Date.now().toString(36);
      const withBg = await prepareWallpaper(file, false);
      const cut = await prepareWallpaper(file, true);
      await mediaPut(base + "-orig", withBg);
      await mediaPut(base + "-cut", cut);
      data.meta.wall.key = base;
      // 智能默认：去背景用「完整显示」，保留背景用「铺满」
      data.meta.wall.size = data.meta.wall.cutout ? "contain" : "cover";
      saveData();
      render({ animate: false });
      toast("壁纸已更新");
    } catch (err) {
      toast("这张图读不出来，换一张试试");
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

  /* 立绘壁纸：贴在最底下，卡片浮在上面 */
  function applyWall() {
    const w = data.meta.wall || {};
    const el = $("wall");
    // 同一个 key 下存了两份：-orig 保留背景、-cut 去掉背景
    const url = w.key ? media[w.key + (w.cutout === false ? "-orig" : "-cut")] || media[w.key + "-orig"] || "" : "";
    if (!url) {
      el.hidden = true;
      el.style.backgroundImage = "";
      appEl.classList.remove("has-wall");
      return;
    }
    const showing = ui.view === "week" ? w.onWeek !== false : ui.view === "today" ? w.onToday !== false : true;
    el.hidden = false;
    appEl.classList.add("has-wall");
    el.style.backgroundImage = 'url("' + url + '")';
    el.style.backgroundSize = w.size === "cover" ? "cover" : "contain";
    el.style.backgroundPosition =
      w.align === "bottom" ? "bottom center" : w.align === "center" ? "center center" : "top center";
    el.style.setProperty("--wall-blur", (Number(w.blur) || 0) + "px");
    el.style.opacity = showing ? String(w.opacity == null ? 0.85 : w.opacity) : "0";
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
      const fullTerm = c.weeks.length === 1 && c.weeks[0][0] === 1 && c.weeks[0][1] >= data.meta.totalWeeks;
      blocks +=
        '<button type="button" class="blk' + (isNow ? " is-now" : "") + (c.kind === "lab" ? " is-lab" : "") +
        '" data-tone="' + c.tone + '" data-span="' + c.span + '"' +
        ' style="--row:' + (c.slot + 1) + ";--span:" + c.span + ";--col:" + (di + 2) + ";--i:" + order + '"' +
        ' data-action="open" data-id="' + c.id + '" aria-label="' + esc(c.name) + " " + weeksLabel(c) + '">' +
        '<span class="blk-name">' + kindMark(c) + esc(c.short || c.name) + "</span>" +
        (c.room ? '<span class="blk-room">' + esc(c.room) + "</span>" : "") +
        (c.teacher ? '<span class="blk-teacher">' + esc(c.teacher) + "</span>" : "") +
        (fullTerm && c.parity === "all" ? "" : '<span class="blk-week">' + weeksLabel(c) + "</span>") +
        "</button>";
    });
    const count = laid.length;

    const firstStart = toMin(SLOTS[0].start);
    const lastEnd = toMin(SLOTS[SLOTS.length - 1].end);
    const showNow = ui.weekOffset === 0 && nowMinutes() > firstStart - 90 && nowMinutes() < lastEnd + 90;
    const nowLine = showNow
      ? '<div class="nowline" style="top:calc(var(--head-h, 46px) + (100% - var(--head-h, 46px)) * ' +
        nowRatio().toFixed(4) +
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
    const w = m.wall || {};
    const version = (base) => media[base + (w.cutout === false ? "-orig" : "-cut")] || media[base + "-orig"] || "";
    const wallUrl = w.key ? version(w.key) : "";
    const wallKeys = Object.keys(media)
      .filter((k) => k.endsWith("-orig") && media[k])
      .map((k) => k.slice(0, -5))
      .sort()
      .reverse();
    const opacityPct = Math.round((w.opacity == null ? 0.85 : w.opacity) * 100);
    const opt = (value, text, current) =>
      '<option value="' + value + '"' + (String(current) === String(value) ? " selected" : "") + ">" + text + "</option>";

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

      '<div class="group"><h2>立绘壁纸</h2>' +
      '<div class="wall-preview">' +
      (wallUrl ? '<img src="' + wallUrl + '" alt="当前壁纸">' : "<span>还没有壁纸，选一张立绘试试</span>") +
      "</div>" +
      '<div class="btn-row" style="padding:2px 0 10px">' +
      '<button type="button" class="btn" data-action="pick-wall">选一张立绘</button>' +
      '<button type="button" class="btn btn-danger" data-action="clear-wall"' + (wallUrl ? "" : " disabled") +
      ">清除壁纸</button>" +
      "</div>" +
      (wallKeys.length > 1
        ? '<div class="wall-thumbs">' +
          wallKeys
            .map(
              (k) =>
                '<button type="button" class="wall-thumb" data-action="use-wall" data-key="' + k +
                '" aria-pressed="' + (k === w.key) + '" aria-label="切换到这张壁纸"><img src="' + version(k) + '" alt=""></button>'
            )
            .join("") +
          "</div>"
        : "") +
      '<div class="field"><span>不透明度</span><span class="wall-range">' +
      '<input type="range" min="10" max="100" step="5" data-wall="opacity" value="' + opacityPct + '"><b>' + opacityPct +
      "%</b></span></div>" +
      '<div class="field"><span>模糊</span><span class="wall-range">' +
      '<input type="range" min="0" max="12" step="1" data-wall="blur" value="' + (w.blur || 0) + '"><b>' +
      (w.blur || 0) + "px</b></span></div>" +
      '<div class="field"><span>位置</span><select data-wall="align">' +
      opt("top", "顶部", w.align) + opt("center", "居中", w.align) + opt("bottom", "底部", w.align) +
      "</select></div>" +
      '<div class="field"><span>大小</span><select data-wall="size">' +
      opt("contain", "完整显示", w.size) + opt("cover", "铺满（可能裁到）", w.size) +
      "</select></div>" +
      '<div class="field"><span>自动去掉背景<span class="hint">浅底立绘打开它；带背景的整图关掉、配合「铺满」</span></span>' +
      '<label class="switch"><input type="checkbox" data-wall="cutout"' + (w.cutout !== false ? " checked" : "") +
      "><i></i></label></div>" +
      '<div class="field"><span>今日页显示</span><label class="switch"><input type="checkbox" data-wall="onToday"' +
      (w.onToday !== false ? " checked" : "") + "><i></i></label></div>" +
      '<div class="field"><span>课表页显示</span><label class="switch"><input type="checkbox" data-wall="onWeek"' +
      (w.onWeek !== false ? " checked" : "") + "><i></i></label></div>" +
      '<div class="hint" style="padding:0 0 12px">每张图都存了「去背景」和「保留背景」两份，拨上面的开关可以立刻对比，不用重新选图。课表页会自动再淡一档，保证课程块看得清。图片只存在这台设备上（浏览器的本地数据库），不上传、也不在 GitHub 仓库里。</div>' +
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
    appEl.dataset.view = ui.view;

    applyTheme();
    applyWall();
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
      } else if (action === "pick-wall") {
        $("wall-file").click();
      } else if (action === "clear-wall") {
        const oldKey = data.meta.wall.key;
        data.meta.wall.key = "";
        if (oldKey) {
          mediaDel(oldKey + "-orig");
          mediaDel(oldKey + "-cut");
        }
        saveData();
        render({ animate: false });
        toast("已清除壁纸");
      } else if (action === "use-wall") {
        data.meta.wall.key = el.dataset.key;
        saveData();
        render({ animate: false });
        toast("已切换壁纸");
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

  // 壁纸参数：拖动时实时预览，松手后保存
  document.addEventListener("input", (event) => {
    const el = event.target.closest('input[type="range"][data-wall]');
    if (!el) return;
    const w = data.meta.wall;
    if (el.dataset.wall === "opacity") w.opacity = clamp(Number(el.value) / 100, 0.1, 1);
    if (el.dataset.wall === "blur") w.blur = clamp(Number(el.value), 0, 12);
    applyWall();
    const label = el.parentElement && el.parentElement.querySelector("b");
    if (label) label.textContent = el.dataset.wall === "opacity" ? Math.round(w.opacity * 100) + "%" : w.blur + "px";
  });

  document.addEventListener("change", (event) => {
    const el = event.target.closest("[data-wall]");
    if (!el) return;
    const key = el.dataset.wall;
    const w = data.meta.wall;
    if (key === "opacity") w.opacity = clamp(Number(el.value) / 100, 0.1, 1);
    else if (key === "blur") w.blur = clamp(Number(el.value), 0, 12);
    else if (el.type === "checkbox") {
      w[key] = el.checked;
      // 去背景配「完整显示」，保留背景配「铺满」，一拨就是最好看的组合
      if (key === "cutout") w.size = el.checked ? "contain" : "cover";
    } else w[key] = el.value;
    saveData();
    render({ animate: false });
  });

  $("wall-file").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (file) importWallpaper(file);
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

  // 先把本地存的壁纸读进内存，再渲染首屏
  (async function boot() {
    await mediaLoadAll();
    render({ first: true });
  })();
})();
