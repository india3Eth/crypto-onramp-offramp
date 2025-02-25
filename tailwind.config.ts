/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	theme: {
	  extend: {
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		//   background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		//   primary: {
		// 	DEFAULT: "hsl(var(--primary))",
		// 	foreground: "hsl(var(--primary-foreground))",
		//   },
		//   secondary: {
		// 	DEFAULT: "hsl(var(--secondary))",
		// 	foreground: "hsl(var(--secondary-foreground))",
		//   },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		//   accent: {
		// 	DEFAULT: "hsl(var(--accent))",
		// 	foreground: "hsl(var(--accent-foreground))",
		//   },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  background: "#2D3250",
		  primary: "#F6B17A",
		  secondary: "#7077A1",
		  accent: "#E8AA42",
		  text: "#FFFFFF",
		  brutalism: {
			red: "#FF5252",
			blue: "#4285F4",
			yellow: "#FFEB3B",
			green: "#00C853",
			purple: "#AA00FF",
		  },
		},
		borderWidth: {
		  brutal: "4px",
		},
		boxShadow: {
		  brutal: "4px 4px 0px rgba(0, 0, 0, 0.9)",
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }
  
  