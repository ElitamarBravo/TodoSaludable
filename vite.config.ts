import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        producto: resolve(__dirname, "producto.html"),
        admin: resolve(__dirname, "admin.html"),
        kalomai: resolve(__dirname, "kalomai.html"),
        kalomaiTravel: resolve(__dirname, "kalomai-travel.html"),
        kalomaiResort: resolve(__dirname, "kalomai-resort.html"),
        kalomaiPark: resolve(__dirname, "kalomai-park.html"),
        bienesRaices: resolve(__dirname, "bienes-raices.html"),
        hotel: resolve(__dirname, "hotel.html"),
        lote: resolve(__dirname, "lote.html"),
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "Todo Saludable con María Isabel",
        short_name: "Todo Saludable",
        description:
          "Tienda de productos saludables y asesoría personalizada con María Isabel.",
        theme_color: "#2F4A3C",
        background_color: "#FAF8F3",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
