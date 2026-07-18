export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0..1 remaining
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  private maxParticles = 500;

  burst(x: number, y: number, color: string, count = 18, speed = 2.4) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const v = speed * (0.5 + Math.random());
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        life: 1,
        maxLife: 1,
        size: 1.5 + Math.random() * 2.5,
        color,
        gravity: 0.02,
      });
    }
  }

  ambient(x: number, y: number, color: string) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.15 - Math.random() * 0.2,
      life: 1,
      maxLife: 1,
      size: 0.8 + Math.random() * 1.6,
      color,
      gravity: -0.002,
    });
  }

  update(dtScale: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dtScale;
      p.y += p.vy * dtScale;
      p.vy += p.gravity * dtScale;
      p.vx *= 0.98;
      p.life -= 0.018 * dtScale;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  clear() {
    this.particles = [];
  }
}
