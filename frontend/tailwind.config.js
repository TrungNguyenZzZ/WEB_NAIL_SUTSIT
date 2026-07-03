/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem"
    },
    extend: {
      colors: {
        blush: "#f6d6de",
        rose: "#e7a7b8",
        petal: "#fff1f5",
        sand: "#f4e6db",
        mint: "#d8efe7",
        cream: "#fffaf6",
        cocoa: "#775b63",
        ink: "#2f2730"
      },
      fontFamily: {
        display: ['"DM Serif Display"', "serif"],
        sans: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 28px 80px rgba(119, 91, 99, 0.16)",
        card: "0 16px 40px rgba(233, 167, 184, 0.16)"
      },
      backgroundImage: {
        "hero-aura":
          "radial-gradient(circle at top left, rgba(231,167,184,0.35), transparent 38%), radial-gradient(circle at top right, rgba(216,239,231,0.45), transparent 34%), linear-gradient(135deg, #fffaf6 0%, #fff6fa 45%, #f9f7f3 100%)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

