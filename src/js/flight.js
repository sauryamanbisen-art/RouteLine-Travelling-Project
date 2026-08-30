(function(){
  "use strict";

  /* =========================================================
     Cloud shader background
  ========================================================= */
  var VERT = "attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=a_pos*0.5+0.5;gl_Position=vec4(a_pos,0.0,1.0);}";

  var FRAG = [
    "precision highp float;",
    "varying vec2 v_uv;",
    "uniform vec2 u_res; uniform float u_time; uniform float u_count;",
    "uniform vec3 u_cloud; uniform vec3 u_skyTop; uniform vec3 u_skyBottom;",
    "const mat2 R = mat2(0.80,0.60,-0.60,0.80);",
    "float hash(vec2 p){return fract(sin(dot(p,vec2(41.31,289.17)))*26737.367);}",
    "float vnoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
    "float fbm(vec2 p){float sum=0.0;float amp=0.5;for(int i=0;i<4;i++){sum+=amp*vnoise(p);p=R*p*2.03+19.19;amp*=0.5;}return sum;}",
    "float billow(vec2 p){float sum=0.0;float amp=0.5;for(int i=0;i<5;i++){sum+=amp*(1.0-abs(2.0*vnoise(p)-1.0));p=R*p*2.11+13.37;amp*=0.5;}return sum;}",
    "float cloudDensity(vec2 p, vec2 c, vec2 r, float seed, float t){vec2 q=p-c;float ry=q.y>0.0?r.y:r.y*0.42;float env=1.0-length(vec2(q.x/r.x,q.y/ry));if(env<-0.35)return 0.0;vec2 dp=q*(2.4/r.x)+seed;dp+=0.6*vec2(fbm(dp*1.4+t*0.04),fbm(dp*1.4+7.7-t*0.03));float detail=billow(dp*1.6);return env+(detail-0.62)*0.62;}",
    "vec3 shadeCloud(vec3 color, vec3 sky, vec2 p, vec2 c, vec2 r, float seed, float t, float dist){float d=cloudDensity(p,c,r,seed,t);if(d<0.02)return color;float dUp=cloudDensity(p+vec2(0.0,r.y*0.55),c,r,seed,t);float occl=clamp((dUp-d)*1.1+d*0.55,0.0,1.0);vec3 lit=u_cloud*1.04;vec3 shadow=mix(u_cloud*0.60,sky,0.38);vec3 cloudCol=mix(lit,shadow,occl*0.85);float alpha=smoothstep(0.02,0.38,d);float rim=smoothstep(0.02,0.14,d)*(1.0-smoothstep(0.14,0.40,d));cloudCol+=rim*0.10;cloudCol=mix(cloudCol,sky,dist*0.35);alpha*=mix(1.0,0.8,dist);return mix(color,cloudCol,alpha);}",
    "vec3 cloudPass(vec3 color, vec3 sky, vec2 p, float aspect, float t, float spd, float phase, float y, vec2 r, float seed, float dist){float cx=mix(-r.x-0.25,aspect+r.x+0.25,fract(t*spd+phase));float cy=y+sin(t*0.05+phase*6.2831)*0.012;return shadeCloud(color,sky,p,vec2(cx,cy),r,seed,t,dist);}",
    "void main(){",
    "float aspect=u_res.x/u_res.y; vec2 p=vec2(v_uv.x*aspect,v_uv.y); float t=u_time;",
    "vec3 sky=mix(u_skyBottom,u_skyTop,v_uv.y); vec3 color=sky;",
    "color=mix(color,u_skyBottom*1.06, smoothstep(0.35,0.0,v_uv.y)*0.5);",
    "vec2 sunPos=vec2(aspect*0.78,0.92); float sunDist=length(p-sunPos);",
    "color+=vec3(1.0,0.9,0.75)*exp(-sunDist*sunDist*5.0)*0.32;",
    "float cirrusBand=smoothstep(0.55,0.8,v_uv.y)*(1.0-smoothstep(0.9,1.0,v_uv.y));",
    "if(cirrusBand>0.01){float streak=fbm(vec2(p.x*1.6-t*0.006,p.y*12.0));float wisp=smoothstep(0.52,0.78,streak)*cirrusBand;color=mix(color,u_cloud*0.98,wisp*0.35);}",
    "if(u_count>5.5){color=cloudPass(color,sky,p,aspect,t,0.006,0.10,0.84,vec2(0.20,0.10),43.7,1.0);}",
    "if(u_count>4.5){color=cloudPass(color,sky,p,aspect,t,0.008,0.62,0.73,vec2(0.24,0.12),71.3,0.85);}",
    "if(u_count>3.5){color=cloudPass(color,sky,p,aspect,t,0.011,0.33,0.60,vec2(0.34,0.16),17.3,0.55);}",
    "if(u_count>2.5){color=cloudPass(color,sky,p,aspect,t,0.013,0.80,0.47,vec2(0.30,0.15),29.9,0.45);}",
    "if(u_count>1.5){color=cloudPass(color,sky,p,aspect,t,0.016,0.05,0.35,vec2(0.46,0.20),91.1,0.15);}",
    "color=cloudPass(color,sky,p,aspect,t,0.020,0.48,0.20,vec2(0.56,0.24),57.2,0.0);",
    "gl_FragColor=vec4(color,1.0);",
    "}"
  ].join("\n");

  function hexToRgb01(hex){
    var v=(hex||"").trim();
    if(v[0]==="#"){
      var h=v.slice(1);
      if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];}
      return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
    }
    return [1,1,1];
  }

  function compile(gl,type,src){
    var s=gl.createShader(type);
    gl.shaderSource(s,src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ gl.deleteShader(s); return null; }
    return s;
  }

  function initCloudShader(canvas, opts){
    var gl = canvas.getContext("webgl", {alpha:false, antialias:false, premultipliedAlpha:false});
    if(!gl) return;

    var vert = compile(gl, gl.VERTEX_SHADER, VERT);
    var frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if(!vert || !frag) return;

    var program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.bindAttribLocation(program, 0, "a_pos");
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var loc = {
      res: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_time"),
      count: gl.getUniformLocation(program, "u_count"),
      cloud: gl.getUniformLocation(program, "u_cloud"),
      skyTop: gl.getUniformLocation(program, "u_skyTop"),
      skyBottom: gl.getUniformLocation(program, "u_skyBottom")
    };

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cloud = hexToRgb01(opts.cloudColor);
    var skyTop = hexToRgb01(opts.skyTopColor);
    var skyBottom = hexToRgb01(opts.skyBottomColor);
    var count = Math.min(6, Math.max(1, opts.count || 6));
    var speed = opts.speed || 1;

    function resize(){
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if(canvas.width !== w || canvas.height !== h){ canvas.width = w; canvas.height = h; }
      gl.viewport(0,0,w,h);
      gl.uniform2f(loc.res, w, h);
    }
    var ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    var start = performance.now();
    var frame;
    function draw(now){
      var elapsed = reduceMotion ? 0 : ((now - start) / 1000) * speed;
      gl.uniform1f(loc.time, elapsed);
      gl.uniform1f(loc.count, count);
      gl.uniform3f(loc.cloud, cloud[0], cloud[1], cloud[2]);
      gl.uniform3f(loc.skyTop, skyTop[0], skyTop[1], skyTop[2]);
      gl.uniform3f(loc.skyBottom, skyBottom[0], skyBottom[1], skyBottom[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
  }

  /* =========================================================
     Booking widget interactivity
  ========================================================= */
  document.addEventListener("DOMContentLoaded", function(){

    const canvas = document.getElementById("cloud-canvas");
    if(canvas) {
      initCloudShader(canvas, {
        speed: 1,
        count: 6,
        cloudColor: "#ffe9d6",
        skyTopColor: "#152a52",
        skyBottomColor: "#f4a373"
      });
    }

    // default departure date = 7 days out
    var departInput = document.getElementById("depart-input");
    var returnInput = document.getElementById("return-input");
    var today = new Date();
    
    if (departInput && returnInput) {
        departInput.min = today.toISOString().slice(0,10);
        var dep = new Date(today.getTime() + 7*86400000);
        departInput.value = dep.toISOString().slice(0,10);

        // ---- one way / round trip ----
        var returnField = document.getElementById("return-field");
        document.querySelectorAll("#trip-toggle button").forEach(function(btn){
        btn.addEventListener("click", function(){
            document.querySelectorAll("#trip-toggle button").forEach(function(b){ b.classList.remove("is-active"); });
            btn.classList.add("is-active");
            var isRound = btn.dataset.trip === "round";
            returnInput.disabled = !isRound;
            returnField.classList.toggle("is-disabled", !isRound);
            if(isRound && !returnInput.value){
            var r = new Date(dep.getTime() + 3*86400000);
            returnInput.value = r.toISOString().slice(0,10);
            }
            returnInput.min = departInput.value;
        });
        });
        departInput.addEventListener("change", function(){ returnInput.min = departInput.value; });
    }

    // ---- swap from/to ----
    var fromInput = document.getElementById("from-input");
    var toInput = document.getElementById("to-input");
    var swapBtn = document.getElementById("swap-btn");
    
    if (swapBtn && fromInput && toInput) {
        swapBtn.addEventListener("click", function(){
        var tmp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = tmp;
        swapBtn.classList.add("is-spinning");
        setTimeout(function(){ swapBtn.classList.remove("is-spinning"); }, 260);
        });
    }

    // ---- travellers panel ----
    var travellersField = document.getElementById("travellers-field");
    var travellersPanel = document.getElementById("travellers-panel");
    var travellersSummary = document.getElementById("travellers-summary");
    
    if (travellersField && travellersPanel && travellersSummary) {
        var counts = {adults:1, children:0};
        var travelClass = "Economy";

        function openPanel(open){
        travellersPanel.classList.toggle("is-open", open);
        }
        travellersField.addEventListener("click", function(e){
        openPanel(!travellersPanel.classList.contains("is-open"));
        e.stopPropagation();
        });
        document.addEventListener("click", function(e){
        if(!travellersField.contains(e.target)) openPanel(false);
        });
        document.addEventListener("keydown", function(e){
        if(e.key === "Escape") openPanel(false);
        });
        travellersPanel.addEventListener("click", function(e){ e.stopPropagation(); });

        document.querySelectorAll("[data-step]").forEach(function(btn){
        btn.addEventListener("click", function(){
            var key = btn.dataset.step;
            var dir = parseInt(btn.dataset.dir, 10);
            var min = key === "adults" ? 1 : 0;
            var max = key === "adults" ? 9 : 6;
            counts[key] = Math.min(max, Math.max(min, counts[key] + dir));
            document.getElementById(key + "-count").textContent = counts[key];
            updateStepperState();
            updateSummary();
        });
        });
        function updateStepperState(){
        document.querySelectorAll("[data-step]").forEach(function(btn){
            var key = btn.dataset.step;
            var dir = parseInt(btn.dataset.dir, 10);
            var min = key === "adults" ? 1 : 0;
            var max = key === "adults" ? 9 : 6;
            var val = counts[key];
            btn.disabled = (dir < 0 && val <= min) || (dir > 0 && val >= max);
        });
        }
        updateStepperState();

        document.querySelectorAll(".class-pill").forEach(function(pill){
        pill.addEventListener("click", function(){
            document.querySelectorAll(".class-pill").forEach(function(p){ p.classList.remove("is-active"); });
            pill.classList.add("is-active");
            travelClass = pill.dataset.class;
            updateSummary();
        });
        });

        function updateSummary(){
        var total = counts.adults + counts.children;
        travellersSummary.textContent = total + (total === 1 ? " traveller · " : " travellers · ") + travelClass;
        }
    }

  });
})();
