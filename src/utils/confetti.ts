interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "text";
  text?: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export class ConfettiGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ConfettiParticle[] = [];
  private animationFrameId: number | null = null;
  private colors = [
    "#FF3366", "#FF9933", "#FFFF33", "#33CC66", 
    "#3399FF", "#9933FF", "#FF33CC", "#00FFFF"
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas 2d context");
    this.ctx = context;
  }

  public resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    }
  }

  public burst(count = 150, winnerName?: string) {
    // No-op to prevent performance issues and lag
  }

  public sideShower(winnerName?: string) {
    // No-op to prevent performance issues and lag
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics update
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // Gravity
      p.vx *= 0.98; // Air resistance
      p.vy *= 0.98;
      p.rotation += p.rotationSpeed;

      // Fade out as it falls out or ages
      if (p.y > this.canvas.height * 0.7) {
        p.opacity -= 0.015;
      }

      if (p.opacity <= 0 || p.x < -50 || p.x > this.canvas.width + 50 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw particle
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;

      this.ctx.beginPath();
      if (p.shape === "circle") {
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === "square") {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === "triangle") {
        this.ctx.moveTo(0, -p.size / 2);
        this.ctx.lineTo(p.size / 2, p.size / 2);
        this.ctx.lineTo(-p.size / 2, p.size / 2);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.shape === "text" && p.text) {
        this.ctx.font = `bold ${p.size}px 'Noto Serif JP', serif`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.shadowColor = "rgba(0,0,0,0.8)";
        this.ctx.shadowBlur = 6;
        this.ctx.fillText(p.text, 0, 0);
        this.ctx.shadowBlur = 0; // reset
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.animationFrameId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
