# 生活助理 App

個人使用的生活儀表板 App，把待辦提醒、記帳、生活數據等分散在不同 App 的功能整合成單一首頁。詳細企劃見專案根目錄提供的企劃書。

## 目前狀態

第一版 MVP：**待辦/提醒卡片**

- 新增待辦（標題／時間／分類：工作·生活·其他）
- 提醒重複：不重複／每日／每週／自訂星期
- 今日／本週／全部檢視
- 完成勾選、逾期標示、分類篩選
- 簡單等級系統：完成待辦獲得 XP，累積 XP 升等

## 技術架構

- **React + TypeScript + Vite**：目前 sandbox 沒有 Flutter / Android SDK，但有 Node.js 與瀏覽器，選用 Web 技術可以馬上開發並在瀏覽器即時驗證。
- **Tailwind CSS**：簡約俐落風格。
- **資料儲存**：`localStorage`（純個人裝置使用，不需要後端或帳號系統）。
- 之後要包成 Android APK，走 **Capacitor**（見下方「包裝成 APK」）。

### 架構重點

- `src/types.ts`：核心資料型別（`Todo`、`Category`、`RepeatRule`）。
- `src/hooks/useTodos.ts`：待辦事項的 CRUD 與重複邏輯。
- `src/hooks/useGamification.ts`：XP／等級計算與持久化。
- `src/hooks/useTodoReminders.ts`：瀏覽器 Notification API 的 best-effort 提醒（僅在分頁開啟時有效，見下方限制）。
- `src/components/Dashboard.tsx`：首頁殼層，未來新模組直接以卡片形式加進 `children`。
- `src/components/cards/`：各功能模組卡片，目前只有 `TodoCard`。

## 開發

```bash
cd app
npm install
npm run dev      # 開發伺服器
npm run build    # 型別檢查 + 正式建置
```

## 通知的限制

MVP 使用瀏覽器 `Notification` API，只有在網頁分頁開啟時才會觸發提醒，無法在 App 關閉時喚醒手機。等包裝成原生 App 後，建議改用 Capacitor 的 [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications) 外掛，資料模型（`Todo.dueAt` / `Todo.repeat`）已經足夠支援排程原生通知，不需要改資料結構。

## 未來擴充規劃（依企劃書優先順序）

| 模組 | 說明 |
|---|---|
| 記帳卡片 | 本月支出總覽、快速記一筆 |
| 生活數據卡片 | 習慣打卡、健康數據（飲水、體重、睡眠） |
| 行事曆/日程卡片 | 顯示當日行程 |
| 捷徑列 | 串連常用功能 |

新增模組的方式：在 `src/components/cards/` 新增一個卡片元件（可參考 `TodoCard.tsx` 的結構：資料 hook + 卡片 UI），再到 `App.tsx` 把卡片加進 `<Dashboard>` 底下即可，不需要更動既有模組。

## 包裝成 Android APK（之後執行，需要 Android Studio / SDK 的環境）

1. `npm install -D @capacitor/core @capacitor/android @capacitor/cli`
2. `npx cap init "生活助理" com.yourname.lifeassistant`
3. `npm run build` 產生 `dist/`
4. `npx cap add android` 建立 Android 專案
5. `npx cap sync android`
6. 用 Android Studio 開啟 `android/` 專案，build 出 APK，直接分享安裝（不會上架 Google Play）。

## 專案定位（來自企劃書）

- 僅供個人手機（ASUS ROG Phone 9）使用，不正式上架 Google Play。
- 視覺風格：簡約俐落。
- 開發時程：無特定期限，依進度彈性推進。
