"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";

const vertex = `attribute vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float charge;
float ring(float r,float radius,float width){return exp(-abs(r-radius)/width);}
void main(){
 vec2 p=(gl_FragCoord.xy*2.-resolution)/min(resolution.x,resolution.y);
 p-=pointer*.09;
 p*=1.14-charge*.17;
 float r=length(p), a=atan(p.y,p.x);
 float wave=sin(a*9.+time*.8+r*15.)*.009+sin(a*15.-time*.6)*.005;
 float metal=ring(r,.58,.045)*(0.32+0.68*pow(abs(sin(a*6.+time*.12)),8.));
 float outer=ring(r,.72,.003)*(0.3+0.7*step(.35,sin(a*36.-time*.2)));
 float segments=ring(r,.49,.022)*(.25+.75*step(-.35,sin(a*12.+time*.25)));
 float core=ring(r+wave,.35,.014)+ring(r+wave*.5,.38,.004);
 float liquid=(sin(a*7.+r*35.-time*1.2)+sin(a*3.-r*22.+time))*.5;
 float inside=(1.-smoothstep(.29,.35,r))*(.18+.12*liquid);
 float glow=exp(-r*r*9.)*(.2+charge*.3);
 vec3 gold=vec3(.83,.53,.16), ice=vec3(.56,.88,1.);
 vec3 color=gold*(metal+outer)+ice*(segments+core+inside+glow);
 color+=vec3(.86,.96,1.)*ring(r,.15+sin(a*3.+time*.4)*.012,.009)*(.4+charge);
 float alpha=clamp(max(color.r,max(color.g,color.b)),0.,1.);
 gl_FragColor=vec4(color,alpha);
}`;

export function ArcReactor() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = root.current!;
    const surface = canvas.current!;
    const gl = surface.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach(s => gl.deleteShader(s));
      gl.deleteProgram(program);
      return;
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = {
      resolution: gl.getUniformLocation(program, "resolution"),
      pointer: gl.getUniformLocation(program, "pointer"),
      time: gl.getUniformLocation(program, "time"),
      charge: gl.getUniformLocation(program, "charge"),
    };
    const state = { charge: 0, x: 0, y: 0 };
    let visible = false;
    let reduced = false;
    let elapsed = 0;
    const draw = () => {
      if (gl.isContextLost()) return;
      gl.uniform2f(uniforms.resolution, surface.width, surface.height);
      gl.uniform2f(uniforms.pointer, state.x, state.y);
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.charge, state.charge);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = Math.round(surface.clientWidth * dpr);
      surface.height = Math.round(surface.clientHeight * dpr);
      gl.viewport(0, 0, surface.width, surface.height);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    intersection.observe(section);
    const tick = (_time: number, delta: number) => {
      if (!visible || reduced || document.hidden) return;
      elapsed += Math.min(delta, 50) / 1000;
      draw();
    };
    gsap.ticker.add(tick);
    const media = gsap.matchMedia();
    media.add({ reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" }, context => {
      reduced = !!context.conditions?.reduced;
      if (reduced) { state.charge = 0.5; draw(); return; }
      const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 65%", end: "bottom 35%", scrub: 0.8 } });
      timeline.to(state, { charge: 1, ease: "none", onUpdate: () => {
        if (readout.current) readout.current.textContent = (3.4 + state.charge * 4.6).toFixed(1).replace(".", ",");
      } }, 0);
      timeline.fromTo(surface, { rotate: -18, scale: 0.88 }, { rotate: 18, scale: 1.06, ease: "none" }, 0);
      gsap.from(section.querySelectorAll("[data-arc-reveal]"), { y: 35, autoAlpha: 0, stagger: 0.12, duration: 1, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 75%", once: true } });
    });
    const move = (event: PointerEvent) => {
      if (reduced || event.pointerType !== "mouse") return;
      const rect = section.getBoundingClientRect();
      state.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      state.y = 1 - (event.clientY - rect.top) / rect.height * 2;
      section.style.setProperty("--glass-x", `${(state.x + 1) * 50}%`);
      section.style.setProperty("--glass-y", `${(1 - state.y) * 50}%`);
    };
    const leave = () => { state.x = 0; state.y = 0; };
    const lost = (event: Event) => { event.preventDefault(); surface.style.opacity = "0"; };
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    surface.addEventListener("webglcontextlost", lost);
    surface.dataset.ready = "true";
    resize();
    return () => {
      media.revert();
      observer.disconnect();
      intersection.disconnect();
      gsap.ticker.remove(tick);
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      surface.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      shaders.forEach(s => gl.deleteShader(s));
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <section ref={root} id="reactor" className="reactor-section" aria-labelledby="reactor-title">
      <div className="reactor-copy">
        <p data-arc-reveal className="reactor-kicker">01 / O coração da armadura</p>
        <h2 data-arc-reveal id="reactor-title">Uma ideia.<br />Energia <em>infinita.</em></h2>
        <p data-arc-reveal className="reactor-description">Toda a força da Mark LXXXV começa aqui. Um núcleo compacto, uma corrente de energia e a vontade de ir além.</p>
        <a data-arc-reveal href="#systems" className="reactor-link">Explorar os sistemas <span aria-hidden>↗</span></a>
      </div>
      <div className="reactor-object" aria-hidden="true">
        <div className="reactor-fallback" />
        <canvas ref={canvas} className="reactor-canvas" />
        <span className="reactor-coordinate">STARK / ARC–85</span>
      </div>
      <div data-arc-reveal className="reactor-readout liquid-glass">
        <span className="reactor-kicker">Núcleo Arc / Simulação</span>
        <p><span ref={readout}>3,4</span><small> GJ/s</small></p>
        <div className="reactor-status"><span /> Fluxo de energia estável</div>
        <span className="reactor-hint">Role para energizar o núcleo</span>
      </div>
    </section>
  );
}
