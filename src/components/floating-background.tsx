"use client"

import { useEffect, useRef } from "react"

interface FloatingIcon {
  x: number
  y: number
  speed: number
  image: HTMLImageElement
  rotation: number
  rotationSpeed: number
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA"]

export function FloatingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const iconsRef = useRef<FloatingIcon[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const iconSvgs = [
      `<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" role="img"><path d="M12 0 9.798 1.266l-6 3.468L1.596 6v12l2.202 1.266 6.055 3.468L12.055 24l2.202-1.266 5.945-3.468L22.404 18V6l-2.202-1.266-6-3.468zM6 15.468V8.532l6-3.468 6 3.468v6.936l-6 3.468z"/></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="${COLORS[2]}" stroke="${COLORS[3]}" stroke-width="2"><circle cx="16" cy="16" r="14" /></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="${COLORS[4]}" stroke="${COLORS[0]}" stroke-width="2"><path d="M16 2L2 16L16 30L30 16L16 2Z" /></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0.004 0 64 64"><path d="M63.04 39.741c-4.274 17.143-21.638 27.575-38.783 23.301C7.12 58.768-3.313 41.404.962 24.262 5.234 7.117 22.597-3.317 39.737.957c17.144 4.274 27.576 21.64 23.302 38.784z" fill="#f7931a"/><path d="M46.11 27.441c.636-4.258-2.606-6.547-7.039-8.074l1.438-5.768-3.512-.875-1.4 5.616c-.922-.23-1.87-.447-2.812-.662l1.41-5.653-3.509-.875-1.439 5.766c-.764-.174-1.514-.346-2.242-.527l.004-.018-4.842-1.209-.934 3.75s2.605.597 2.55.634c1.422.355 1.68 1.296 1.636 2.042l-1.638 6.571c.098.025.225.061.365.117l-.37-.092-2.297 9.205c-.174.432-.615 1.08-1.609.834.035.051-2.552-.637-2.552-.637l-1.743 4.02 4.57 1.139c.85.213 1.683.436 2.502.646l-1.453 5.835 3.507.875 1.44-5.772c.957.26 1.887.5 2.797.726L27.504 50.8l3.511.875 1.453-5.823c5.987 1.133 10.49.676 12.383-4.738 1.527-4.36-.075-6.875-3.225-8.516 2.294-.531 4.022-2.04 4.483-5.157zM38.087 38.69c-1.086 4.36-8.426 2.004-10.807 1.412l1.928-7.729c2.38.594 10.011 1.77 8.88 6.317zm1.085-11.312c-.99 3.966-7.1 1.951-9.083 1.457l1.748-7.01c1.983.494 8.367 1.416 7.335 5.553z" fill="#ffffff"/></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 32 32" id="_x3C_Layer_x3E_" version="1.1" xml:space="preserve">

<style type="text/css">
<![CDATA[
	.st0{fill:#E3F2FD;}
	.st1{fill:#80D8FF;}
	.st2{fill:#1AD2A4;}
	.st3{fill:#ECEFF1;}
	.st4{fill:#55FB9B;}
	.st5{fill:#BBDEFB;}
	.st6{fill:#C1AEE1;}
	.st7{fill:#FF5252;}
	.st8{fill:#FF8A80;}
	.st9{fill:#FFB74D;}
	.st10{fill:#FFF176;}
	.st11{fill:#FFFFFF;}
	.st12{fill:#65C7EA;}
	.st13{fill:#CFD8DC;}
	.st14{fill:#37474F;}
	.st15{fill:#78909C;}
	.st16{fill:#42A5F5;}
	.st17{fill:#455A64;}
]]>
</style>

<g id="Ethereum_x2C__crypto_x2C__cryptocurrency_1_">

<g id="XMLID_2_">

<g id="XMLID_41_">

<polygon class="st1" id="XMLID_690_" points="7.62,18.83 16.01,30.5 16.01,24.1    "/>

</g>

<g id="XMLID_42_">

<polygon class="st16" id="XMLID_13_" points="16.01,30.5 24.38,18.78 16.01,24.1    "/>

</g>

<g id="XMLID_43_">

<polygon class="st10" id="XMLID_14_" points="16.01,1.5 7.62,16.23 16.01,12.3    "/>

</g>

<g id="XMLID_46_">

<polygon class="st8" id="XMLID_15_" points="24.38,16.18 16.01,1.5 16.01,12.3    "/>

</g>

<g id="XMLID_47_">

<polygon class="st6" id="XMLID_16_" points="16.01,21.5 24.38,16.18 16.01,12.3    "/>

</g>

<g id="XMLID_48_">

<polygon class="st4" id="XMLID_18_" points="16.01,12.3 7.62,16.23 16.01,21.5    "/>

</g>

</g>

<g id="XMLID_4_">

<g id="XMLID_19_">

<path class="st17" d="M16.01,22c-0.09,0-0.18-0.03-0.27-0.08l-8.39-5.27c-0.23-0.14-0.3-0.44-0.17-0.67     l8.39-14.73c0.18-0.31,0.69-0.31,0.87,0l8.36,14.68c0.13,0.23,0.06,0.53-0.17,0.67l-8.36,5.32C16.2,21.97,16.11,22,16.01,22z      M8.3,16.06l7.71,4.85l7.69-4.89L16.01,2.51L8.3,16.06z" id="XMLID_764_"/>

</g>

<g id="XMLID_31_">

<path class="st17" d="M16.01,31c-0.28,0-0.5-0.22-0.5-0.5v-6.4c0-0.28,0.22-0.5,0.5-0.5s0.5,0.22,0.5,0.5v6.4     C16.51,30.78,16.29,31,16.01,31z" id="XMLID_763_"/>

</g>

<g id="XMLID_20_">

<path class="st17" d="M16.01,31c-0.16,0-0.31-0.08-0.41-0.21L7.22,19.12c-0.14-0.19-0.12-0.46,0.04-0.63     c0.16-0.17,0.43-0.21,0.63-0.08l8.12,5.11l8.1-5.15c0.2-0.13,0.47-0.1,0.63,0.08c0.16,0.17,0.18,0.44,0.04,0.63l-8.36,11.72     C16.33,30.92,16.16,30.98,16.01,31z M9.52,20.61l6.49,9.03l6.47-9.06l-6.2,3.94c-0.16,0.1-0.37,0.1-0.53,0L9.52,20.61z" id="XMLID_760_"/>

</g>

<g id="XMLID_30_">

<path class="st17" d="M16.01,22c-0.09,0-0.18-0.03-0.27-0.08l-8.39-5.27c-0.15-0.1-0.24-0.27-0.23-0.45     s0.12-0.34,0.29-0.42l8.39-3.93c0.13-0.06,0.29-0.06,0.42,0l8.36,3.88c0.17,0.08,0.28,0.24,0.29,0.42     c0.01,0.18-0.08,0.36-0.23,0.45l-8.36,5.32C16.2,21.97,16.11,22,16.01,22z M8.67,16.29l7.34,4.62l7.33-4.66l-7.32-3.4L8.67,16.29     z" id="XMLID_757_"/>

</g>

<g id="XMLID_32_">

<path class="st17" d="M16.01,22c-0.28,0-0.5-0.22-0.5-0.5v-20c0-0.28,0.22-0.5,0.5-0.5s0.5,0.22,0.5,0.5v20     C16.51,21.78,16.29,22,16.01,22z" id="XMLID_756_"/>

</g>

<g id="XMLID_192_">

<path class="st17" d="M16.01,22c-0.09,0-0.18-0.03-0.27-0.08l-8.39-5.27c-0.23-0.14-0.3-0.44-0.17-0.67     l8.39-14.73c0.18-0.31,0.69-0.31,0.87,0l8.36,14.68c0.13,0.23,0.06,0.53-0.17,0.67l-8.36,5.32C16.2,21.97,16.11,22,16.01,22z      M8.3,16.06l7.71,4.85l7.69-4.89L16.01,2.51L8.3,16.06z" id="XMLID_753_"/>

</g>

</g>

</g>

</svg>`
    ]

    const loadImages = async () => {
      const images = await Promise.all(
        iconSvgs.map((svg) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image()
            const blob = new Blob([svg], { type: "image/svg+xml" })
            const url = URL.createObjectURL(blob)
            img.onload = () => {
              URL.revokeObjectURL(url)
              resolve(img)
            }
            img.crossOrigin = "anonymous"
            img.src = url
          })
        }),
      )

      iconsRef.current = Array.from({ length: 15 }, () => {
        const image = images[Math.floor(Math.random() * images.length)]
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.2 + Math.random() * 0.5,
          image,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
        }
      })

      animate()
    }

    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      iconsRef.current.forEach((icon) => {
        icon.y -= icon.speed
        icon.rotation += icon.rotationSpeed

        if (icon.y < -50) {
          icon.y = canvas.height + 50
          icon.x = Math.random() * canvas.width
        }

        ctx.save()
        ctx.translate(icon.x, icon.y)
        ctx.rotate((icon.rotation * Math.PI) / 180)
        ctx.globalAlpha = 0.6
        ctx.drawImage(icon.image, -16, -16, 32, 32)
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    loadImages()

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-gradient-to-b from-purple-900 via-blue-900 to-black -z-10"
    />
  )
}

