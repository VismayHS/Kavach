import { useEffect, useRef } from 'react'

/**
 * Floating particles background — pure canvas animation.
 * Subtle protective "shield grid" effect with floating dots and connections.
 */
export default function AnimatedBackground({ particleCount = 45, color = '79, 110, 247', maxOpacity = 0.25 }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animId
        let particles = []

        const resize = () => {
            canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1)
            canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1)
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
        }

        const createParticles = () => {
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            particles = Array.from({ length: particleCount }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.8 + 0.6,
                opacity: Math.random() * maxOpacity + 0.05,
            }))
        }

        const draw = () => {
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            ctx.clearRect(0, 0, w, h)

            // Move and draw particles
            for (const p of particles) {
                p.x += p.vx
                p.y += p.vy

                // Wrap around
                if (p.x < 0) p.x = w
                if (p.x > w) p.x = 0
                if (p.y < 0) p.y = h
                if (p.y > h) p.y = 0

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${color}, ${p.opacity})`
                ctx.fill()
            }

            // Draw connections
            const maxDist = 120
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.06
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(${color}, ${alpha})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }

            animId = requestAnimationFrame(draw)
        }

        resize()
        createParticles()
        draw()

        window.addEventListener('resize', () => {
            resize()
            createParticles()
        })

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [particleCount, color, maxOpacity])

    return (
        <canvas
            ref={canvasRef}
            className="animated-bg-canvas"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    )
}
