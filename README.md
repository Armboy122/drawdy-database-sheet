# Drawdy Database Sheet & Table Viewer Extension

ส่วนเสริม (Extension) สำหรับ **Drawdy Whiteboard** ตามมาตรฐาน Drawdy Driver Protocol (DDP) เพื่อเปิดใช้งานตารางสเปรดชีตและตัวอย่างโมเดลฐานข้อมูลแบบโต้ตอบได้บนกระดาน

## ✨ คุณสมบัติเด่น (Features)
1. **Interactive Multi-Table Sheet**:
   - รองรับ 4 แท็บข้อมูลมาตรฐาน: `Users`, `Products`, `Orders`, `Invoices`
   - ค้นหาและกรองข้อมูลแบบ Real-time
   - ดับเบิลคลิกแก้ไขข้อมูลในเซลล์ได้ทันที (`Inline Edit`)
   - ปุ่มเพิ่มแถวข้อมูลใหม่ (`➕ เพิ่มแถว`) และลบแถวที่ไม่ต้องการ
2. **Export to CSV**:
   - ดาวน์โหลดข้อมูลในตารางออกมาเป็นไฟล์ `.csv` สำหรับนำไปเปิดใน Excel หรือ Google Sheets
3. **Export to Canvas (ส่งออกไปยังกระดาน)**:
   - คลิกปุ่มเดียว ข้อมูลในตารางจะถูกแปลงเป็นการ์ดข้อมูลและเสกลงบนกระดาน Drawdy ทันที
   - กล้อง Drawdy จะบินซูมเข้าไปยังตำแหน่งการ์ดที่เพิ่งสร้างโดยอัตโนมัติ
4. **Convenient Launch Options**:
   - ปุ่มลัดบน Action Bar ด้านบน: `📊 ตารางฐานข้อมูล (Database Sheet)`
   - คลิกขวาบนกระดาน (Context Menu): `📊 เปิด Database Sheet Webview`

## 📦 โครงสร้างไฟล์
- `manifest.json`: รายละเอียด Extension และสิทธิ์ที่ต้องการ (`dom`, `scene`)
- `main.js`: โค้ดหลักในการควบคุม Webview และเชื่อมต่อกับ Drawdy Scene
- `icon.svg`: ไอคอนรูปตารางฐานข้อมูล

## 🚀 วิธีติดตั้งใช้งาน
1. **ติดตั้งเป็น Private Extension บน Cloud Board**:
   - นำโฟลเดอร์นี้ขึ้น GitHub Repository (Public)
   - ไปที่ [drawdy.io/account/extensions](https://drawdy.io/account/extensions) -> แท็บ **Submit** -> เลือก **Private**
   - วาง URL ของ Repo แล้วกด **Add extension**
   - บนกระดาน Drawdy กดที่ไอคอนต่อขยาย 🧩 -> แท็บ **Private** -> กด **Install**
2. **ทดสอบบน Local Board**:
   - เปิดโฟลเดอร์นี้แล้วรัน Dev Server ที่พอร์ต `5173`
   - บน Local Board กด `⌘K` -> เลือก `Add extension dev server` -> ใส่ `http://localhost:5173`
