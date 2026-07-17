import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "apps",

  server: {
    port: 5173,
    strictPort: true,
    host: true
  },

  preview: {
    port: 4173,
    strictPort: true,
    host: true
  },

  build: {
    outDir: "../dist",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        index:            resolve(__dirname, "apps/index.html"),
        login:            resolve(__dirname, "apps/login.html"),
        dashboard:        resolve(__dirname, "apps/dashboard.html"),
        addNote:          resolve(__dirname, "apps/add-note.html"),
        board:            resolve(__dirname, "apps/board.html"),
        calendar:         resolve(__dirname, "apps/calendar.html"),
        category:         resolve(__dirname, "apps/category.html"),
        categorySettings: resolve(__dirname, "apps/category-settings.html"),
        noteDetail:       resolve(__dirname, "apps/note-detail.html"),
        reminder:         resolve(__dirname, "apps/reminder.html"),
        search:           resolve(__dirname, "apps/search.html"),
        settings:         resolve(__dirname, "apps/settings.html"),
        welcome:          resolve(__dirname, "apps/welcome.html"),
        hub:              resolve(__dirname, "apps/hub.html"),
        maps:             resolve(__dirname, "apps/maps.html")
      }
    }
  }
});