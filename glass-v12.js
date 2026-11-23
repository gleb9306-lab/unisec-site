/* Full-surface glass: bounded render resolution, 30 fps, no background work in hidden tabs. */
function mountLiquidGlass(host, reduced) {
  const canvas=document.createElement('canvas');
  canvas.className='liquid-surface';canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power',premultipliedAlpha:false});
  if(!gl)return;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Glass shader');return s;};
  let program;
  try {
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
precision mediump float;
uniform vec2 resolution;
uniform float time;
void main(){
 vec2 q=(gl_FragCoord.xy-.5*resolution)/min(resolution.x,resolution.y);
 float t=time*.14;
 float a=q.x*3.4+sin(q.y*2.1+t)*1.1+t*.6;
 float b=q.y*4.1+sin(q.x*2.3-t*.7)*1.2-t*.4;
 float c=(q.x+q.y)*5.2+sin(q.x*1.7-q.y*1.4+t*.5)*.8;
 float d=(q.x-q.y)*7.1-t*.6;
 float ax=3.4,ay=2.31*cos(q.y*2.1+t);
 float bx=2.76*cos(q.x*2.3-t*.7),by=4.1;
 float cx=5.2+1.36*cos(q.x*1.7-q.y*1.4+t*.5);
 float cy=5.2-1.12*cos(q.x*1.7-q.y*1.4+t*.5);
 vec2 slope=.32*cos(a)*vec2(ax,ay)+.24*cos(b)*vec2(bx,by)+.13*cos(c)*vec2(cx,cy)+.045*cos(d)*vec2(7.1,-7.1);
 vec3 normal=normalize(vec3(slope*.72,1.));
 vec3 ray=reflect(vec3(0.,0.,-1.),normal);
 // Soft studio reflections, silver rims and teal refraction across a continuous surface.
 float band=ray.x*.72+ray.y*.55+sin(ray.y*2.4+t*.18)*.18;
 float wide=exp(-pow((band-.28)*5.,2.));
 float rim=exp(-pow((band-.38)*42.,2.));
 float second=exp(-pow((ray.y-ray.x*.32+.38)*24.,2.));
 float shade=smoothstep(.3,1.1,length(slope));
 float shine=wide*.19+rim*.5+second*.21;
 vec3 color=mix(vec3(.025,.08,.095),vec3(.39,.68,.71),wide);
 color=mix(color,vec3(.77,.9,.9),clamp(rim*.8+second*.45,0.,1.));
 float alpha=clamp(.07+shade*.14+shine*.7,0.,.65);
 gl_FragColor=vec4(color,alpha);
}`));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  } catch (_) {return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const size=gl.getUniformLocation(program,'resolution'),clock=gl.getUniformLocation(program,'time');
  let frame=0,last=0,elapsed=0,previous=0,lost=false;
  const render=(now)=>{
    frame=0;if(document.hidden||lost)return;
    if(now-last>=33){
      if(previous)elapsed+=Math.min(now-previous,80);previous=now;last=now;
      gl.uniform1f(clock,reduced.matches?12:elapsed/1000);gl.drawArrays(gl.TRIANGLES,0,6);
    }
    if(!reduced.matches)frame=requestAnimationFrame(render);
  };
  const start=()=>{if(!frame&&!document.hidden&&!lost){previous=0;last=0;frame=requestAnimationFrame(render);}};
  const resize=()=>{
    const scale=Math.min(1,1100/Math.max(innerWidth,innerHeight));
    canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);
    gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(size,canvas.width,canvas.height);start();
  };
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;host.classList.remove('has-liquid-surface');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;}else start();});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;start();});
  addEventListener('resize',resize,{passive:true});
  host.appendChild(canvas);host.classList.add('has-liquid-surface');resize();
}
