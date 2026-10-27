"use strict";

const ACTION_BTN_INSERT = "btn-insert-table";
const ACTION_BTN_ADD_ROW = "btn-add-table-row";
const MENU_INSERT = "menu-insert-table";
const MENU_QUICK_3 = "menu-quick-3";
const WEBVIEW_ID = "table-creator-dialog";

let issue;
let driverId;
let generateId;
let reqSeq = 0;
const nextRequestId = () => String(reqSeq++);

// Keep track of last created table on canvas
let lastTable = null;

const THEMES = {
  blue: { headerBg: "#0284c7", headerBorder: "#0369a1", altBg: "#f0f9ff", highlightBg: "#e0f2fe", border: "#cbd5e1" },
  emerald: { headerBg: "#059669", headerBorder: "#047857", altBg: "#f0fdf4", highlightBg: "#dcfce7", border: "#cbd5e1" },
  purple: { headerBg: "#7c3aed", headerBorder: "#6d28d9", altBg: "#faf5ff", highlightBg: "#f3e8ff", border: "#cbd5e1" },
  amber: { headerBg: "#d97706", headerBorder: "#b45309", altBg: "#fffbeb", highlightBg: "#fef3c7", border: "#cbd5e1" },
  dark: { headerBg: "#1e293b", headerBorder: "#334155", altBg: "#0f172a", highlightBg: "#1e293b", border: "#334155" }
};

function buildCreatorHtml() {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>สร้างตารางเปรียบเทียบข้อมูล</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 18px; font-size: 13px; line-height: 1.5; }
    h2 { font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    p.sub { font-size: 12px; color: #94a3b8; margin-bottom: 14px; }
    .section-title { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .templates { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
    .tpl-btn { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px; cursor: pointer; text-align: left; transition: all 0.15s; }
    .tpl-btn:hover { background: #334155; border-color: #38bdf8; }
    .tpl-btn.active { background: #0284c7; border-color: #38bdf8; color: #fff; }
    .tpl-name { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
    .tpl-desc { font-size: 11px; opacity: 0.8; }
    .form-group { margin-bottom: 12px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 4px; }
    input[type="text"], input[type="number"] { width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 8px 10px; color: #fff; font-size: 12px; outline: none; }
    input:focus { border-color: #38bdf8; }
    .row-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .color-picker { display: flex; gap: 8px; margin-top: 4px; }
    .color-opt { width: 26px; height: 26px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: transform 0.1s; }
    .color-opt:hover { transform: scale(1.1); }
    .color-opt.active { border-color: #fff; }
    .btn-create { width: 100%; background: #0284c7; color: #fff; border: none; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 14px; transition: background 0.15s; }
    .btn-create:hover { background: #0369a1; }
  </style>
</head>
<body>
  <h2>📊 แทรกตาราง Sheet เปรียบเทียบข้อมูล</h2>
  <p class="sub">เลือกรูปแบบหรือกำหนดคอลัมน์/แถวได้อิสระ ตารางจะถูกวาดลงบนกระดาน Drawdy ทันที</p>

  <div class="section-title">1. เลือกรูปแบบตารางสำเร็จรูป (Preset Template)</div>
  <div class="templates">
    <div class="tpl-btn active" onclick="selectTemplate('compare3')">
      <div class="tpl-name">📋 เปรียบเทียบ 3 คอลัมน์</div>
      <div class="tpl-desc">หัวข้อ | ตัวเลือก A | ตัวเลือก B</div>
    </div>
    <div class="tpl-btn" onclick="selectTemplate('compare4')">
      <div class="tpl-name">📊 เปรียบเทียบ 4 คอลัมน์</div>
      <div class="tpl-desc">หัวข้อ | ทางเลือก 1 | ทางเลือก 2 | หมายเหตุ</div>
    </div>
    <div class="tpl-btn" onclick="selectTemplate('proscons')">
      <div class="tpl-name">⚖️ ข้อดี vs ข้อเสีย</div>
      <div class="tpl-desc">ประเด็น | ข้อดี (Pros) | ข้อเสีย (Cons) | ข้อสรุป</div>
    </div>
    <div class="tpl-btn" onclick="selectTemplate('pricing')">
      <div class="tpl-name">💰 ตารางราคา & สเปก</div>
      <div class="tpl-desc">แพ็กเกจ | ราคา | คุณสมบัติ | ความคุ้มค่า</div>
    </div>
  </div>

  <div class="form-group">
    <label>ชื่อตาราง (Table Title)</label>
    <input type="text" id="tableTitle" value="ตารางเปรียบเทียบข้อมูล (Comparison Matrix)" />
  </div>

  <div class="form-group">
    <label>ชื่อคอลัมน์ (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
    <input type="text" id="tableColumns" value="หัวข้อ / ฟีเจอร์, ❌ ตัวเลือกเดิม (Option A), ✅ ตัวเลือกใหม่ (Option B), 💡 ข้อได้เปรียบ / ผลลัพธ์" />
  </div>

  <div class="row-cols">
    <div class="form-group">
      <label>จำนวนแถวเริ่มต้น (Rows)</label>
      <input type="number" id="rowCount" value="4" min="1" max="15" />
    </div>
    <div class="form-group">
      <label>ธีมสีหัวตาราง (Theme)</label>
      <div class="color-picker" id="colorPicker">
        <div class="color-opt active" style="background: #0284c7;" onclick="selectTheme('blue', this)"></div>
        <div class="color-opt" style="background: #059669;" onclick="selectTheme('emerald', this)"></div>
        <div class="color-opt" style="background: #7c3aed;" onclick="selectTheme('purple', this)"></div>
        <div class="color-opt" style="background: #d97706;" onclick="selectTheme('amber', this)"></div>
        <div class="color-opt" style="background: #1e293b;" onclick="selectTheme('dark', this)"></div>
      </div>
    </div>
  </div>

  <button class="btn-create" onclick="submitTable()">✨ วาดตารางลง Canvas ทันที</button>

  <script>
    let currentTheme = "blue";
    let drawdy = null;
    try {
      if (typeof acquireDrawdyApi === "function") {
        drawdy = acquireDrawdyApi();
      }
    } catch(e) {}

    const templates = {
      compare3: {
        title: "ตารางเปรียบเทียบ 2 ตัวเลือก (Comparison A vs B)",
        columns: "หัวข้อ / ปัจจัย, ทางเลือก A (ระบบเดิม), ทางเลือก B (ระบบใหม่)",
        rows: 4
      },
      compare4: {
        title: "ตารางเปรียบเทียบฟีเจอร์ครบวงจร (Feature Matrix)",
        columns: "หัวข้อ / ฟีเจอร์, ❌ ทำเองในองค์กร, ✅ ใช้โซลูชันภายนอก, 💡 ผลลัพธ์ / หมายเหตุ",
        rows: 4
      },
      proscons: {
        title: "ตารางวิเคราะห์ข้อดี-ข้อเสีย (Pros & Cons Analysis)",
        columns: "ประเด็นพิจารณา, 👍 ข้อดี (Pros), ⚠️ ข้อจำกัด (Cons), 🎯 ข้อสรุปและทางออก",
        rows: 3
      },
      pricing: {
        title: "ตารางเปรียบเทียบแพ็กเกจราคา (Pricing Sheet)",
        columns: "ระดับแพ็กเกจ (Tier), ราคาต่อเดือน, สเปก / ฟีเจอร์ที่ได้รับ, กลุ่มลูกค้าที่เหมาะสม",
        rows: 3
      }
    };

    function selectTemplate(key) {
      document.querySelectorAll(".tpl-btn").forEach(b => b.classList.remove("active"));
      event.currentTarget.classList.add("active");
      const t = templates[key];
      if (t) {
        document.getElementById("tableTitle").value = t.title;
        document.getElementById("tableColumns").value = t.columns;
        document.getElementById("rowCount").value = t.rows;
      }
    }

    function selectTheme(theme, el) {
      currentTheme = theme;
      document.querySelectorAll(".color-opt").forEach(c => c.classList.remove("active"));
      el.classList.add("active");
    }

    function submitTable() {
      const title = document.getElementById("tableTitle").value.trim() || "ตารางเปรียบเทียบ";
      const colStr = document.getElementById("tableColumns").value.trim();
      const columns = colStr ? colStr.split(",").map(c => c.trim()).filter(Boolean) : ["คอลัมน์ 1", "คอลัมน์ 2"];
      const rowCount = parseInt(document.getElementById("rowCount").value, 10) || 3;

      if (drawdy) {
        drawdy.postMessage({
          type: "create_canvas_table",
          title,
          columns,
          rowCount,
          theme: currentTheme
        });
      } else {
        alert("สร้างตาราง: " + title + " (" + columns.length + " คอลัมน์, " + rowCount + " แถว)");
      }
    }
  </script>
</body>
</html>`;
}

async function openCreatorDialog() {
  await issue({
    type: "command:webview:create",
    driverId,
    requestId: nextRequestId(),
    req: {
      webviewId: WEBVIEW_ID,
      title: "📊 แทรกตาราง Sheet เปรียบเทียบข้อมูล",
      srcDoc: buildCreatorHtml(),
      width: 580,
      height: 540
    }
  });
}

async function createTableOnCanvas(opts) {
  const title = opts.title || "ตารางเปรียบเทียบ";
  const columns = opts.columns && opts.columns.length > 0 ? opts.columns : ["หัวข้อ", "ตัวเลือก A", "ตัวเลือก B"];
  const rowCount = opts.rowCount || 4;
  const themeKey = opts.theme || "blue";
  const theme = THEMES[themeKey] || THEMES.blue;

  // 1. Get camera info to place table in front of user
  let cameraX = 2000;
  let cameraY = 600;
  try {
    const camRes = await issue({
      type: "command:camera:get-info",
      driverId,
      requestId: nextRequestId(),
      req: {}
    });
    if (camRes && camRes.res && camRes.res.value) {
      cameraX = camRes.res.value.x;
      cameraY = camRes.res.value.y;
    }
  } catch (e) {}

  // Column width calculation: average 240px per col, min 180, max 320
  const colCount = columns.length;
  const colWidth = Math.max(200, Math.min(300, Math.floor(1000 / colCount)));
  const totalWidth = colWidth * colCount;
  const headerHeight = 48;
  const rowHeight = 44;

  const startX = Math.round(cameraX - (totalWidth / 2));
  const startY = Math.round(cameraY - ((headerHeight + (rowCount * rowHeight)) / 2));

  const elements = [];
  const createdIds = [];

  // Table Title Header Card
  const titleId = generateId ? generateId() : "title_" + Date.now();
  elements.push({
    type: "shape",
    componentType: "rect",
    drawdyElementId: titleId,
    x: startX,
    y: startY - 44,
    width: totalWidth,
    height: 38,
    strokeColor: theme.headerBorder,
    fillColor: theme.headerBg,
    text: `📊 ${title}`,
    fontSize: 16
  });
  createdIds.push(titleId);

  // Column Headers
  let curX = startX;
  const headerY = startY;
  for (let c = 0; c < colCount; c++) {
    const cellId = generateId ? generateId() : `head_${c}_${Date.now()}`;
    elements.push({
      type: "shape",
      componentType: "rect",
      drawdyElementId: cellId,
      x: curX,
      y: headerY,
      width: colWidth,
      height: headerHeight,
      strokeColor: theme.headerBorder,
      fillColor: theme.headerBg,
      text: columns[c],
      fontSize: 14
    });
    createdIds.push(cellId);
    curX += colWidth;
  }

  // Body Rows
  for (let r = 0; r < rowCount; r++) {
    const curY = startY + headerHeight + (r * rowHeight);
    curX = startX;
    const bg = (r % 2 === 0) ? "#ffffff" : theme.altBg;

    for (let c = 0; c < colCount; c++) {
      const cellId = generateId ? generateId() : `cell_${r}_${c}_${Date.now()}`;
      let cellText = "";
      if (c === 0) {
        cellText = `ประเด็นที่ ${r + 1}`;
      } else {
        cellText = "พิมพ์ข้อมูลเปรียบเทียบที่นี่...";
      }

      elements.push({
        type: "shape",
        componentType: "rect",
        drawdyElementId: cellId,
        x: curX,
        y: curY,
        width: colWidth,
        height: rowHeight,
        strokeColor: theme.border,
        fillColor: bg,
        text: cellText,
        fontSize: 13
      });
      createdIds.push(cellId);
      curX += colWidth;
    }
  }

  // Remember table info for Add Row button
  lastTable = {
    startX,
    startY,
    colWidth,
    colCount,
    rowCount,
    rowHeight,
    headerHeight,
    theme
  };

  // Issue add elements command
  await issue({
    type: "command:scene:add-drawdy-elements",
    driverId,
    requestId: nextRequestId(),
    req: { elements }
  });

  // Smooth fly-to camera
  await issue({
    type: "command:camera:fly-to-elements",
    driverId,
    requestId: nextRequestId(),
    req: {
      drawdyElementIds: createdIds,
      flyDurationMs: 500,
      zoom: 0.95
    }
  });

  // Close creator dialog
  try {
    await issue({
      type: "command:webview:close",
      driverId,
      requestId: nextRequestId(),
      req: { webviewId: WEBVIEW_ID }
    });
  } catch(e) {}
}

async function addRowToLastTable() {
  if (!lastTable) {
    // If no last table, create a quick 3-column table
    await createTableOnCanvas({
      title: "ตารางเปรียบเทียบ (Comparison Sheet)",
      columns: ["หัวข้อ / เกณฑ์", "ทางเลือก A", "ทางเลือก B"],
      rowCount: 3,
      theme: "blue"
    });
    return;
  }

  const { startX, startY, colWidth, colCount, rowCount, rowHeight, headerHeight, theme } = lastTable;
  const newRowIndex = rowCount;
  const curY = startY + headerHeight + (newRowIndex * rowHeight);
  const bg = (newRowIndex % 2 === 0) ? "#ffffff" : theme.altBg;

  const elements = [];
  const createdIds = [];
  let curX = startX;

  for (let c = 0; c < colCount; c++) {
    const cellId = generateId ? generateId() : `row_${newRowIndex}_${c}_${Date.now()}`;
    const cellText = c === 0 ? `ประเด็นที่ ${newRowIndex + 1}` : "ดับเบิลคลิกเพื่อกรอกข้อมูล";
    elements.push({
      type: "shape",
      componentType: "rect",
      drawdyElementId: cellId,
      x: curX,
      y: curY,
      width: colWidth,
      height: rowHeight,
      strokeColor: theme.border,
      fillColor: bg,
      text: cellText,
      fontSize: 13
    });
    createdIds.push(cellId);
    curX += colWidth;
  }

  lastTable.rowCount += 1;

  await issue({
    type: "command:scene:add-drawdy-elements",
    driverId,
    requestId: nextRequestId(),
    req: { elements }
  });

  await issue({
    type: "command:camera:fly-to-elements",
    driverId,
    requestId: nextRequestId(),
    req: {
      drawdyElementIds: createdIds,
      flyDurationMs: 300,
      zoom: 0.95
    }
  });
}

exports.activate = async (ctx) => {
  issue = ctx.issueCommand;
  driverId = ctx.manifest.driverId;
  generateId = ctx.generateId;

  // 1. Action Bar Button 1: Insert Table
  await issue({
    type: "command:dom:create-action-button",
    driverId,
    requestId: nextRequestId(),
    req: {
      buttonId: ACTION_BTN_INSERT,
      label: "📊 แทรกตาราง Sheet (Insert Table)",
      position: "top"
    }
  });

  // 2. Action Bar Button 2: Add Row
  await issue({
    type: "command:dom:create-action-button",
    driverId,
    requestId: nextRequestId(),
    req: {
      buttonId: ACTION_BTN_ADD_ROW,
      label: "➕ เพิ่มแถว (Add Row)",
      position: "top"
    }
  });

  // 3. Subscriptions for Action Buttons
  await issue({
    type: "subscription:dom:element-clicked",
    driverId,
    requestId: nextRequestId(),
    req: { elementId: ACTION_BTN_INSERT }
  });
  await issue({
    type: "subscription:dom:element-clicked",
    driverId,
    requestId: nextRequestId(),
    req: { elementId: ACTION_BTN_ADD_ROW }
  });

  // 4. Context Menu 1: Open Dialog
  await issue({
    type: "command:context-menu:add",
    driverId,
    requestId: nextRequestId(),
    req: {
      menuId: MENU_INSERT,
      menuTitle: "📊 แทรกตาราง Sheet เปรียบเทียบข้อมูล...",
      target: "canvas"
    }
  });
  await issue({
    type: "subscription:context-menu:clicked",
    driverId,
    requestId: nextRequestId(),
    req: { menuId: MENU_INSERT }
  });

  // 5. Context Menu 2: Quick 3-Col Comparison
  await issue({
    type: "command:context-menu:add",
    driverId,
    requestId: nextRequestId(),
    req: {
      menuId: MENU_QUICK_3,
      menuTitle: "📋 สร้างตารางเปรียบเทียบด่วน 3 คอลัมน์ (A vs B)",
      target: "canvas"
    }
  });
  await issue({
    type: "subscription:context-menu:clicked",
    driverId,
    requestId: nextRequestId(),
    req: { menuId: MENU_QUICK_3 }
  });

  // 6. Subscription for Webview Messages
  await issue({
    type: "subscription:webview:message",
    driverId,
    requestId: nextRequestId(),
    req: { webviewId: WEBVIEW_ID }
  });
};

exports.onEvent = async (event) => {
  if (event.type === "subscription:dom:element-clicked") {
    if (event.body.elementId === ACTION_BTN_INSERT) {
      await openCreatorDialog();
    } else if (event.body.elementId === ACTION_BTN_ADD_ROW) {
      await addRowToLastTable();
    }
  } else if (event.type === "subscription:context-menu:clicked") {
    if (event.body.menuId === MENU_INSERT) {
      await openCreatorDialog();
    } else if (event.body.menuId === MENU_QUICK_3) {
      await createTableOnCanvas({
        title: "ตารางเปรียบเทียบข้อมูล (Comparison Matrix)",
        columns: ["หัวข้อ / ประเด็น", "❌ ตัวเลือก A (ระบบเดิม)", "✅ ตัวเลือก B (ระบบใหม่)"],
        rowCount: 4,
        theme: "blue"
      });
    }
  } else if (event.type === "subscription:webview:message" && event.body.webviewId === WEBVIEW_ID) {
    const msg = event.body.message;
    if (msg && msg.type === "create_canvas_table") {
      await createTableOnCanvas(msg);
    }
  }
};
