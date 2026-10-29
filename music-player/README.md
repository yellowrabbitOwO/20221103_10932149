# 簡單音樂播放器（Android）

無廣告、功能精簡的本機 MP3 播放器，為 ROG Phone 9 Pro（Android 15）打造，也支援 Android 8.0 以上的手機。

## 功能
- 自動讀取手機裡所有 MP3（透過系統媒體庫，任何資料夾都抓得到）
- 依資料夾篩選、搜尋歌名／歌手／專輯
- 播放／暫停、上一首／下一首、進度拖曳、隨機播放、循環（全部／單曲）
- 背景播放，通知列與鎖定畫面都能控制，支援藍牙／耳機線控
- 拔掉耳機自動暫停，來電或其他 App 播放聲音時自動讓出
- 顯示 MP3 內嵌的專輯封面

## 安裝
1. 用手機打開 GitHub 這個 repo 的 **Releases**，下載 `SimpleMusicPlayer.apk`
   （或在 Actions 頁面下載 `SimpleMusicPlayer` artifact）。
2. 點開 APK，若出現提示，允許瀏覽器／檔案管理器「安裝不明應用程式」。
3. 第一次開啟時允許「音樂和音訊」與「通知」權限。

> 如果某些 MP3 沒出現，通常是系統媒體庫還沒掃到，重開機或把檔案移到 `Music` 資料夾即可。

## 自己建置
需要 JDK 17 與 Android SDK：
```
cd music-player
./gradlew assembleRelease
```
APK 輸出在 `app/build/outputs/apk/release/app-release.apk`。
