"use strict";

const ACTION_BTN_ID = "btn-db-sheet";
const MENU_ID = "menu-db-sheet";
const WEBVIEW_ID = "db-sheet-webview";

let issue;
let driverId;
let generateId;
let reqSeq = 0;
const nextRequestId = () => String(reqSeq++);

// Initial Datasets
const DATASETS = {
  users: {
    name: "Users (ผู้ใช้งาน)",
    columns: ["id", "email", "full_name", "role", "status", "created_at"],
    types: ["UUID [PK]", "VARCHAR(255)", "VARCHAR(100)", "VARCHAR(30)", "VARCHAR(20)", "TIMESTAMPTZ"],
    rows: [
      ["usr_001", "somchai@example.com", "สมชาย ใจดี", "tenant", "active", "2026-10-01 09:00"],
      ["usr_002", "waraporn@company.co", "วราภรณ์ สุขเกษม", "host", "active", "2026-10-05 11:30"],
      ["usr_003", "kitti.p@startup.io", "กิตติ พงษ์ศิริ", "admin", "active", "2026-10-10 14:15"],
      ["usr_004", "sarah.w@global.net", "Sarah Wilson", "tenant", "active", "2026-10-15 16:45"],
      ["usr_005", "anan.c@retail.th", "อนันต์ ชัยชนะ", "tenant", "suspended", "2026-10-20 18:20"]
    ]
  },
  products: {
    name: "Products (สินค้า & บริการ)",
    columns: ["id", "sku", "title", "category", "price_thb", "stock_qty"],
    types: ["UUID [PK]", "VARCHAR(50)", "VARCHAR(150)", "VARCHAR(50)", "NUMERIC(10,2)", "INT"],
    rows: [
      ["prd_001", "IOT-MTR-01", "สมาร์ทมิเตอร์ไฟฟ้า 1-Phase 100A", "iot", "2450.00", "120"],
      ["prd_002", "IOT-GW-MESH", "เกตเวย์รับส่งสัญญาณ LoRa/Zigbee", "iot", "4800.00", "45"],
      ["prd_003", "SUB-EMB-MO", "ไลเซนส์ Embedded Analytics / ห้อง", "addon", "25.00", "9999"],
      ["prd_004", "SVC-SETUP", "บริการเชื่อมต่อและ Setup ระบบ API", "utility", "0.00", "999"],
      ["prd_005", "IOT-CT-SENSOR", "หม้อแปลงกระแส Current Transformer", "iot", "650.00", "350"]
    ]
  },
  orders: {
    name: "Orders (คำสั่งซื้อ & การจอง)",
    columns: ["id", "order_no", "user_id", "total_amount", "order_status", "placed_at"],
    types: ["UUID [PK]", "VARCHAR(30)", "UUID [FK]", "NUMERIC(12,2)", "VARCHAR(20)", "TIMESTAMPTZ"],
    rows: [
      ["ord_001", "ORD-202610-001", "usr_001", "4925.00", "paid", "2026-10-25 14:30"],
      ["ord_002", "ORD-202610-002", "usr_002", "24000.00", "paid", "2026-10-26 09:15"],
      ["ord_003", "ORD-202610-003", "usr_004", "2450.00", "pending", "2026-10-27 10:00"],
      ["ord_004", "ORD-202610-004", "usr_003", "7275.00", "paid", "2026-10-27 18:00"]
    ]
  },
  invoices: {
    name: "Invoices (ใบแจ้งหนี้ & ชำระเงิน)",
    columns: ["id", "invoice_no", "order_id", "due_date", "payment_method", "paid_at"],
    types: ["UUID [PK]", "VARCHAR(30)", "UUID [FK]", "DATE", "VARCHAR(30)", "TIMESTAMPTZ"],
    rows: [
      ["inv_001", "INV-202610-8801", "ord_001", "2026-10-31", "promptpay", "2026-10-25 14:32"],
      ["inv_002", "INV-202610-8802", "ord_002", "2026-10-31", "credit_card", "2026-10-26 09:18"],
      ["inv_003", "INV-202610-8803", "ord_003", "2026-11-05", "promptpay", "null"],
      ["inv_004", "INV-202610-8804", "ord_004", "2026-10-31", "bank_transfer", "2026-10-27 18:05"]
    ]
  }
};

function buildWebviewHtml() {
  const jsonStr = JSON.stringify(DATASETS);
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Database Sheet & Table Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 16px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
    .header h2 { font-size: 16px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .tabs { display: flex; gap: 6px; margin-bottom: 12px; }
    .tab-btn { background: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; }
    .tab-btn:hover { background: #334155; color: #fff; }
    .tab-btn.active { background: #0284c7; color: #ffffff; border-color: #38bdf8; }
    .toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
    .search-input { flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 12px; color: #fff; font-size: 12px; outline: none; }
    .search-input:focus { border-color: #38bdf8; }
    .btn { background: #334155; color: #f1f5f9; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; transition: background 0.15s; }
    .btn:hover { background: #475569; }
    .btn-primary { background: #0284c7; color: #fff; }
    .btn-primary:hover { background: #0369a1; }
    .btn-success { background: #10b981; color: #fff; }
    .btn-success:hover { background: #059669; }
    .table-container { max-height: 380px; overflow-y: auto; border: 1px solid #334155; border-radius: 8px; background: #1e293b; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #111827; color: #94a3b8; font-weight: 600; padding: 8px 12px; border-bottom: 1px solid #334155; position: sticky; top: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 12px; border-bottom: 1px solid #2d3748; color: #e2e8f0; font-size: 12px; }
    tr:hover { background: rgba(56, 189, 248, 0.08); }
    .cell-editable { outline: none; padding: 2px 4px; border-radius: 4px; border: 1px solid transparent; }
    .cell-editable:focus { border-color: #38bdf8; background: #0f172a; }
    .badge-pk { background: #ef4444; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; margin-left: 4px; }
    .badge-fk { background: #f59e0b; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; margin-left: 4px; }
    .btn-del { color: #f87171; cursor: pointer; background: none; border: none; font-size: 13px; }
    .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; color: #64748b; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>📊 Database Sheet & Table Viewer</h2>
    <span style="color: #10b981; font-weight: 600; font-size: 11px;">● Live In-Memory Sync</span>
  </div>

  <div class="tabs" id="tabContainer"></div>

  <div class="toolbar">
    <input type="text" id="searchInput" class="search-input" placeholder="🔍 ค้นหาข้อมูลในตาราง..." oninput="renderTable()" />
    <button class="btn btn-primary" onclick="addRow()">➕ เพิ่มแถว</button>
    <button class="btn" onclick="exportCsv()">📥 ส่งออก CSV</button>
    <button class="btn btn-success" onclick="exportToCanvas()">🎨 ส่งออกไปยังกระดาน</button>
  </div>

  <div class="table-container">
    <table id="dataTable">
      <thead id="tableHead"></thead>
      <tbody id="tableBody"></tbody>
    </table>
  </div>

  <div class="footer">
    <span id="rowStats">กำลังโหลดข้อมูล...</span>
    <span>Drawdy Driver Protocol • Generic RDBMS Model</span>
  </div>

  <script>
    const datasets = ${jsonStr};
    let currentKey = "users";
    let drawdyApi = null;
    try {
      if (typeof acquireDrawdyApi === "function") {
        drawdyApi = acquireDrawdyApi();
      }
    } catch(e) {}

    function renderTabs() {
      const tc = document.getElementById("tabContainer");
      tc.innerHTML = "";
      Object.keys(datasets).forEach(k => {
        const btn = document.createElement("button");
        btn.className = "tab-btn " + (k === currentKey ? "active" : "");
        btn.innerText = datasets[k].name + " (" + datasets[k].rows.length + ")";
        btn.onclick = () => { currentKey = k; renderTabs(); renderTable(); };
        tc.appendChild(btn);
      });
    }

    function renderTable() {
      const query = (document.getElementById("searchInput").value || "").toLowerCase();
      const ds = datasets[currentKey];
      const th = document.getElementById("tableHead");
      const tb = document.getElementById("tableBody");

      let headHtml = "<tr>";
      ds.columns.forEach((col, idx) => {
        const typeInfo = ds.types[idx] || "";
        let badge = "";
        if (typeInfo.includes("[PK]")) badge = '<span class="badge-pk">PK</span>';
        else if (typeInfo.includes("[FK]")) badge = '<span class="badge-fk">FK</span>';
        headHtml += '<th>' + col + badge + '<br><span style="font-size:9px; color:#64748b; font-weight:normal;">' + typeInfo.replace(/\\[.*?\\]/, "") + '</span></th>';
      });
      headHtml += '<th style="width: 40px; text-align: center;">ลบ</th></tr>';
      th.innerHTML = headHtml;

      let bodyHtml = "";
      let count = 0;
      ds.rows.forEach((row, rIdx) => {
        const rowStr = row.join(" ").toLowerCase();
        if (query && !rowStr.includes(query)) return;
        count++;
        bodyHtml += "<tr>";
        row.forEach((cell, cIdx) => {
          bodyHtml += '<td><div class="cell-editable" contenteditable="true" onblur="updateCell(' + rIdx + ',' + cIdx + ', this.innerText)">' + cell + '</div></td>';
        });
        bodyHtml += '<td style="text-align: center;"><button class="btn-del" onclick="deleteRow(' + rIdx + ')" title="ลบแถวนี้">✕</button></td></tr>';
      });
      tb.innerHTML = bodyHtml;

      document.getElementById("rowStats").innerText = "แสดง " + count + " จาก " + ds.rows.length + " แถว • ตาราง " + ds.name;
    }

    function updateCell(r, c, val) {
      datasets[currentKey].rows[r][c] = val;
    }

    function addRow() {
      const ds = datasets[currentKey];
      const newRow = ds.columns.map((col, idx) => {
        if (idx === 0) return currentKey.slice(0, 3) + "_" + String(ds.rows.length + 1).padStart(3, "0");
        return "New " + col;
      });
      ds.rows.push(newRow);
      renderTabs();
      renderTable();
    }

    function deleteRow(rIdx) {
      datasets[currentKey].rows.splice(rIdx, 1);
      renderTabs();
      renderTable();
    }

    function exportCsv() {
      const ds = datasets[currentKey];
      let csv = ds.columns.join(",") + "\\n";
      ds.rows.forEach(r => {
        csv += r.map(c => '"' + c.replace(/"/g, '""') + '"').join(",") + "\\n";
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = currentKey + "_export.csv";
      link.click();
    }

    function exportToCanvas() {
      const ds = datasets[currentKey];
      if (drawdyApi) {
        drawdyApi.postMessage({
          type: "export_table_to_canvas",
          tableKey: currentKey,
          tableName: ds.name,
          columns: ds.columns,
          rows: ds.rows
        });
        alert("ส่งออกตารางไปยังกระดาน Drawdy เรียบร้อยแล้ว!");
      } else {
        alert("กำลังทำงานในโหมด Standalone: " + ds.name + " (" + ds.rows.length + " แถว)");
      }
    }

    renderTabs();
    renderTable();
  </script>
</body>
</html>`;
}

async function openWebview() {
  await issue({
    type: "command:webview:create",
    driverId,
    requestId: nextRequestId(),
    req: {
      webviewId: WEBVIEW_ID,
      title: "📊 Database Sheet & Table Viewer",
      srcDoc: buildWebviewHtml(),
      width: 820,
      height: 560
    }
  });
}

exports.activate = async (ctx) => {
  issue = ctx.issueCommand;
  driverId = ctx.manifest.driverId;
  generateId = ctx.generateId;

  // 1. Create Top Action Button
  await issue({
    type: "command:dom:create-action-button",
    driverId,
    requestId: nextRequestId(),
    req: {
      buttonId: ACTION_BTN_ID,
      label: "📊 ตารางฐานข้อมูล (Database Sheet)",
      position: "top"
    }
  });

  // 2. Subscriptions for Button
  await issue({
    type: "subscription:dom:element-clicked",
    driverId,
    requestId: nextRequestId(),
    req: { elementId: ACTION_BTN_ID }
  });

  // 3. Create Context Menu
  await issue({
    type: "command:context-menu:add",
    driverId,
    requestId: nextRequestId(),
    req: {
      menuId: MENU_ID,
      menuTitle: "📊 เปิด Database Sheet Webview",
      target: "canvas"
    }
  });

  // 4. Subscriptions for Context Menu
  await issue({
    type: "subscription:context-menu:clicked",
    driverId,
    requestId: nextRequestId(),
    req: { menuId: MENU_ID }
  });

  // 5. Subscription for Webview Messages
  await issue({
    type: "subscription:webview:message",
    driverId,
    requestId: nextRequestId(),
    req: { webviewId: WEBVIEW_ID }
  });
};

exports.onEvent = async (event) => {
  if (event.type === "subscription:dom:element-clicked" && event.body.elementId === ACTION_BTN_ID) {
    await openWebview();
  } else if (event.type === "subscription:context-menu:clicked" && event.body.menuId === MENU_ID) {
    await openWebview();
  } else if (event.type === "subscription:webview:message" && event.body.webviewId === WEBVIEW_ID) {
    const msg = event.body.message;
    if (msg && msg.type === "export_table_to_canvas") {
      const cardId = generateId ? generateId() : "card_" + Date.now();
      let bodyText = "";
      (msg.rows || []).slice(0, 6).forEach((r, idx) => {
        bodyText += `[#${idx + 1}] ` + r.join(" | ") + "\n";
      });
      if ((msg.rows || []).length > 6) {
        bodyText += `... และอีก ${msg.rows.length - 6} แถว`;
      }

      // Add a fresh card on the canvas
      await issue({
        type: "command:scene:add-drawdy-elements",
        driverId,
        requestId: nextRequestId(),
        req: {
          elements: [
            {
              type: "card",
              drawdyElementId: cardId,
              x: 3700,
              y: 1100,
              width: 820,
              title: `📊 ส่งออกข้อมูล: ${msg.tableName} (${msg.rows.length} แถว)`,
              body: bodyText,
              background: "teal"
            }
          ]
        }
      });

      // Fly camera to it
      await issue({
        type: "command:camera:fly-to-elements",
        driverId,
        requestId: nextRequestId(),
        req: {
          drawdyElementIds: [cardId],
          flyDurationMs: 500,
          zoom: 0.9
        }
      });
    }
  }
};
