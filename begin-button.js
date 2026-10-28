// Border shader adapted from the supplied React Bits SpecularButton.
(() => {
const PAD = 24;
const TAU = Math.PI * 2;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uPx;
uniform float uSpot;
uniform vec2 uEntry;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform vec2 uWindow;
uniform float uThickness;
uniform float uGlow;
out vec4 outColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float loopPosition(vec2 p, vec2 b, float r) {
  vec2 inner = b - r;
  float arc = 1.5707963 * r;
  float quarter = inner.x + inner.y + arc;
  vec2 a = abs(p);
  vec2 q = a - inner;
  float s = q.x > 0.0 && q.y > 0.0
    ? inner.y + atan(q.y, q.x) * r
    : (q.x > q.y ? min(a.y, inner.y) : inner.y + arc + inner.x - min(a.x, inner.x));
  if (p.x < 0.0) s = p.y >= 0.0 ? 2.0 * quarter - s : 2.0 * quarter + s;
  else if (p.y < 0.0) s = 4.0 * quarter - s;
  return s / max(4.0 * quarter, 0.0001);
}

float lobe(float position, float center) {
  float gap = abs(fract(position - center + 0.5) - 0.5);
  return 1.0 - smoothstep(uWindow.x, uWindow.x + uWindow.y, gap);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = roundedBox(p, uHalf, uRadius);
  float position = loopPosition(p, uHalf, uRadius);
  float key = lobe(position, uSpot);
  float back = lobe(position, uSpot + 0.5);
  float streak = key + back * 0.45;
  float width = max(uThickness * uPx * mix(1.0, max(key, back), 0.6), 0.35);
  float band = smoothstep(-width - 0.6, -width + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float hair = smoothstep(-uPx - 0.6, -uPx + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float inside = 1.0 - smoothstep(-0.6, 0.6, d);
  vec2 pool = (p - uEntry) / (uHalf.y * vec2(1.6, 1.1));
  float glow = streak * 0.2 * exp(-abs(d + width * 0.5) / (5.0 * uPx));
  float light = clamp((band * streak + glow * uGlow) * uIntensity, 0.0, 1.0);
  vec4 base = vec4(uBaseColor, 1.0) * hair * 0.6;
  outColor = vec4(uLineColor, 1.0) * light + base * (1.0 - light);
}`;

const UNIFORMS = [
  'uCenter',
  'uHalf',
  'uRadius',
  'uPx',
  'uSpot',
  'uEntry',
  'uLineColor',
  'uBaseColor',
  'uIntensity',
  'uWindow',
  'uThickness',
  'uGlow'
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const wrap = value => value - Math.floor(value);

const loopPosition = (x, y, halfX, halfY, r) => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const qx = ax - innerX;
  const qy = ay - innerY;
  let s;
  if (qx > 0 && qy > 0) s = innerY + Math.atan2(qy, qx) * r;
  else if (qx > qy) s = Math.min(ay, innerY);
  else s = innerY + arc + innerX - Math.min(ax, innerX);
  if (x < 0) s = y >= 0 ? 2 * quarter - s : 2 * quarter + s;
  else if (y < 0) s = 4 * quarter - s;
  return wrap(s / Math.max(4 * quarter, 0.0001));
};

const rimPoint = (position, halfX, halfY, r) => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  let s = wrap(position) * 4 * quarter;
  let signX = 1;
  let signY = 1;
  if (s > 3 * quarter) {
    s = 4 * quarter - s;
    signY = -1;
  } else if (s > 2 * quarter) {
    s -= 2 * quarter;
    signX = -1;
    signY = -1;
  } else if (s > quarter) {
    s = 2 * quarter - s;
    signX = -1;
  }
  let x = innerX - (s - innerY - arc);
  let y = halfY;
  if (s <= innerY) {
    x = halfX;
    y = s;
  } else if (s <= innerY + arc) {
    const angle = (s - innerY) / Math.max(r, 0.0001);
    x = innerX + Math.cos(angle) * r;
    y = innerY + Math.sin(angle) * r;
  }
  return [x * signX, y * signY];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = gl => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};


const button=document.getElementById('begin-button'),buttonWrap=document.getElementById('begin-wrap');
window.addEventListener('moira-tagline-complete',()=>{if(!window.moiraReveal.isExiting)buttonWrap.classList.add('is-visible');});
setupStroke(button,buttonWrap);
setupStroke(document.getElementById('pricing-button'),document.getElementById('main-nav'));
function setupStroke(button,buttonWrap){
const canvas=button.querySelector('canvas');
const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false});
if(!gl)return;
const program=link(gl);if(!program)return;
const uniforms={};for(const name of UNIFORMS)uniforms[name]=gl.getUniformLocation(program,name);
const buffer=gl.createBuffer(),vao=gl.createVertexArray();
gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
let w=1,h=1,ratio=1,spot=.1,level=.4,last=0,px=0,py=0,known=false;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function measure(){w=button.offsetWidth;h=button.offsetHeight;ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round((w+48)*ratio);canvas.height=Math.round((h+48)*ratio);}
new ResizeObserver(measure).observe(button);measure();
window.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;known=true;},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>known=false);
function frame(now){
 const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
 if(buttonWrap.classList.contains('is-visible')){
  const rect=button.getBoundingClientRect(),x=px-rect.left-w/2,y=rect.top+h/2-py;
  const distance=Math.hypot(Math.max(Math.abs(x)-w/2,0),Math.max(Math.abs(y)-h/2,0));
  const near=known?clamp(1-distance/220,0,1):0;
  if(near>0){let delta=loopPosition(x,y,w/2,h/2,18)-spot;delta-=Math.round(delta);spot=wrapUnit(spot+delta*(1-Math.exp(-dt*8)));}
  else if(!reduce)spot=wrapUnit(spot+dt*.035);
  level+=((.4+near*.6)-level)*(1-Math.exp(-dt*7));
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
  gl.uniform2f(uniforms.uCenter,(24+w/2)*ratio,(24+h/2)*ratio);gl.uniform2f(uniforms.uHalf,w/2*ratio,h/2*ratio);
  gl.uniform1f(uniforms.uRadius,18*ratio);gl.uniform1f(uniforms.uPx,ratio);gl.uniform1f(uniforms.uSpot,spot);
  const rim=rimPoint(spot,w/2,h/2,18);gl.uniform2f(uniforms.uEntry,rim[0]*ratio,rim[1]*ratio);
  gl.uniform3fv(uniforms.uLineColor,[1,.87,.57]);gl.uniform3fv(uniforms.uBaseColor,[.65,.47,.24]);
  gl.uniform1f(uniforms.uIntensity,level*1.5);gl.uniform2f(uniforms.uWindow,12/360,42/360);
  gl.uniform1f(uniforms.uThickness,1.2);gl.uniform1f(uniforms.uGlow,1.1);
  gl.bindVertexArray(vao);gl.drawArrays(gl.TRIANGLES,0,3);
 }
 requestAnimationFrame(frame);
}
function wrapUnit(v){return v-Math.floor(v)}
requestAnimationFrame(frame);
}
})();
