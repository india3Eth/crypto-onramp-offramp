/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	theme: {
	  container: {
		center: true,
		padding: "2rem",
		screens: {
		  "2xl": "1400px",
		},
	  },
	  extend: {
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "#FF3D00",
			foreground: "#FFFFFF",
		  },
		  secondary: {
			DEFAULT: "#6B38FB",
			foreground: "#FFFFFF",
		  },
		  destructive: {
			DEFAULT: "#FF3333",
			foreground: "#FFFFFF",
		  },
		  muted: {
			DEFAULT: "#F0F7FF",
			foreground: "#000000",
		  },
		  accent: {
			DEFAULT: "#00E676",
			foreground: "#000000",
		  },
		  card: {
			DEFAULT: "#FFFFFF",
			foreground: "#000000",
		  },
		  gradient: {
			start: "#FF3D00",
			mid: "#6B38FB",
			end: "#00E676",
		  },
		},
		borderRadius: {
		  lg: "2px",
		  md: "2px",
		  sm: "2px",
		},
		boxShadow: {
		  "brutal-sm": "2px 2px 0px rgba(0, 0, 0, 0.9)",
		  "brutal-md": "4px 4px 0px rgba(0, 0, 0, 0.9)",
		  "brutal-lg": "6px 6px 0px rgba(0, 0, 0, 0.9)",
		},
		borderWidth: {
		  brutal: "3px",
		},
		keyframes: {
		  "accordion-down": {
			from: { height: 0 },
			to: { height: "var(--radix-accordion-content-height)" },
		  },
		  "accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: 0 },
		  },
		  "gradient-flow": {
			"0%, 100%": {
			  "background-position": "0% 50%",
			},
			"50%": {
			  "background-position": "100% 50%",
			},
		  },
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		  "gradient-flow": "gradient-flow 15s ease infinite",
		},
		backgroundImage: {
		  "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }
  
  