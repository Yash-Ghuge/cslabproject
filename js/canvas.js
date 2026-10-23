/**
 * Atmospheric Weather Canvas Engine
 * Renders immersive dynamic weather effects (rain, sunbeams, stars, mist, lightning)
 * Highly optimized, responsive to device pixel ratio, and weather state changes.
 */

class WeatherCanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.weatherType = "sunny"; // 'sunny', 'night', 'rain', 'clouds', 'thunder'
    this.isDay = true;
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animationFrameId = null;
    this.lastTime = 0;
    this.lightningAlpha = 0;
    this.lightningNextTrigger = Date.now() + 4000;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize(), { passive: true });
    this.createParticles();
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    // Recreate particles on size change
    this.createParticles();
  }

  setWeatherState(weatherCode, isDay) {
    this.isDay = isDay === 1 || isDay === true;

    // Map WMO code to particle mode
    if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
      this.weatherType = "thunder";
    } else if (
      weatherCode === 51 || weatherCode === 53 || weatherCode === 55 ||
      weatherCode === 61 || weatherCode === 63 || weatherCode === 65 ||
      weatherCode === 80 || weatherCode === 81 || weatherCode === 82
    ) {
      this.weatherType = "rain";
    } else if (weatherCode === 45 || weatherCode === 48 || weatherCode === 3) {
      this.weatherType = "clouds";
    } else if (!this.isDay) {
      this.weatherType = "night";
    } else {
      this.weatherType = "sunny";
    }

    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    const count = this.getParticleCount();

    for (let i = 0; i < count; i++) {
      this.particles.push(this.generateParticle(true));
    }
  }

  getParticleCount() {
    const isMobile = this.width < 768;
    switch (this.weatherType) {
      case "rain":
      case "thunder":
        return isMobile ? 65 : 130;
      case "night":
        return isMobile ? 40 : 80;
      case "sunny":
        return isMobile ? 25 : 50;
      case "clouds":
        return isMobile ? 20 : 35;
      default:
        return 30;
    }
  }

  generateParticle(randomInitialY = false) {
    const initialY = randomInitialY ? Math.random() * this.height : -20;

    switch (this.weatherType) {
      case "rain":
      case "thunder":
        return {
          x: Math.random() * (this.width + 100) - 50,
          y: initialY,
          length: Math.random() * 22 + 14,
          speed: Math.random() * 8 + 14,
          opacity: Math.random() * 0.4 + 0.3,
          slant: -2.5,
          width: Math.random() * 1.5 + 0.8
        };

      case "night":
        return {
          x: Math.random() * this.width,
          y: initialY,
          radius: Math.random() * 1.8 + 0.5,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2
        };

      case "sunny":
        return {
          x: Math.random() * this.width,
          y: randomInitialY ? Math.random() * this.height : this.height + 20,
          radius: Math.random() * 3.5 + 1.2,
          speedY: Math.random() * 0.4 + 0.2,
          speedX: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.45 + 0.15,
          pulse: Math.random() * Math.PI * 2
        };

      case "clouds":
      default:
        return {
          x: Math.random() * this.width,
          y: initialY,
          radius: Math.random() * 45 + 25,
          speedX: Math.random() * 0.3 + 0.15,
          alpha: Math.random() * 0.08 + 0.03
        };
    }
  }

  start() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    const animate = (timestamp) => {
      this.render();
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Weather type specific animation loop
    switch (this.weatherType) {
      case "rain":
      case "thunder":
        this.renderRain();
        if (this.weatherType === "thunder") {
          this.renderLightning();
        }
        break;
      case "night":
        this.renderStars();
        break;
      case "sunny":
        this.renderSunMotes();
        break;
      case "clouds":
        this.renderMistClouds();
        break;
    }
  }

  renderRain() {
    this.ctx.strokeStyle = "rgba(147, 197, 253, 0.65)";
    this.ctx.lineCap = "round";

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.lineWidth = p.width;
      this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;

      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x + p.slant, p.y + p.length);
      this.ctx.stroke();

      p.y += p.speed;
      p.x += p.slant;

      if (p.y > this.height) {
        this.particles[i] = this.generateParticle(false);
      }
    }
  }

  renderLightning() {
    const now = Date.now();
    if (now > this.lightningNextTrigger) {
      this.lightningAlpha = 0.28;
      this.lightningNextTrigger = now + Math.random() * 6000 + 4000;
    }

    if (this.lightningAlpha > 0.01) {
      this.ctx.fillStyle = `rgba(216, 180, 254, ${this.lightningAlpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.lightningAlpha *= 0.88;
    }
  }

  renderStars() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.phase += p.speed;
      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));

      this.ctx.fillStyle = `rgba(254, 240, 138, ${currentAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderSunMotes() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.pulse += 0.02;
      p.y -= p.speedY;
      p.x += p.speedX;

      const dynamicAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      // Golden amber particles
      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      grad.addColorStop(0, `rgba(255, 209, 102, ${dynamicAlpha})`);
      grad.addColorStop(1, "rgba(255, 153, 51, 0)");

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      this.ctx.fill();

      if (p.y < -20 || p.x < 0 || p.x > this.width) {
        this.particles[i] = this.generateParticle(false);
      }
    }
  }

  renderMistClouds() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;

      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(203, 213, 225, ${p.alpha})`);
      grad.addColorStop(1, "rgba(148, 163, 184, 0)");

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      if (p.x - p.radius > this.width) {
        p.x = -p.radius;
      }
    }
  }
}
