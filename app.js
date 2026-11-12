const audio=document.querySelector('#audio'), input=document.querySelector('#fileInput');
const $=id=>document.getElementById(id); let playlist=[], current=-1, shuffle=false, lyricsByName={};
const fmt=s=>{if(!isFinite(s))return'0:00';let m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+String(sec).padStart(2,'0')};
$('addBtn').onclick=()=>input.click();
input.onchange=()=>{[...input.files].forEach(file=>{if(!file.type.startsWith('audio/'))return;playlist.push({file,url:URL.createObjectURL(file),name:file.name.replace(/\.[^.]+$/,''),artist:'내 기기에서 가져온 음악'});});render();if(current<0&&playlist.length)load(0);input.value=''};
function render(){ $('count').textContent=playlist.length+' TRACKS';let box=$('tracks');box.innerHTML='';if(!playlist.length){box.innerHTML='<div class="empty">＋ 버튼을 눌러 기기에 있는 음악 파일을 추가하세요.</div>';return}playlist.forEach((t,i)=>{let el=document.createElement('div');el.className='track'+(i===current?' active':'');el.innerHTML=`<div class="thumb">N</div><div class="meta"><strong></strong><small>LOCAL AUDIO</small></div><span>•••</span>`;el.querySelector('strong').textContent=t.name;el.onclick=()=>load(i,true);box.append(el)})}
function load(i,autoplay=false){if(!playlist.length)return;current=(i+playlist.length)%playlist.length;let t=playlist[current];audio.src=t.url;$('title').textContent=t.name;$('artist').textContent=t.artist;$('lyricsText').value=lyricsByName[t.name]||'';render();if(autoplay)audio.play().catch(()=>{});updateMedia()}
function updateMedia(){if(!('mediaSession'in navigator)||current<0)return;let t=playlist[current];try{navigator.mediaSession.metadata=new MediaMetadata({title:t.name,artist:t.artist,album:'NOCTURNE'});navigator.mediaSession.setActionHandler('play',()=>audio.play());navigator.mediaSession.setActionHandler('pause',()=>audio.pause());navigator.mediaSession.setActionHandler('previoustrack',()=>load(current-1,true));navigator.mediaSession.setActionHandler('nexttrack',()=>next());navigator.mediaSession.setActionHandler('seekto',d=>{if(d.seekTime!=null)audio.currentTime=d.seekTime})}catch(e){}}
function next(){if(!playlist.length)return;load(shuffle?Math.floor(Math.random()*playlist.length):current+1,true)}
$('play').onclick=()=>{if(current<0){if(playlist.length)load(0,true);return}audio.paused?audio.play():audio.pause()};
$('prev').onclick=()=>{if(audio.currentTime>3)audio.currentTime=0;else load(current-1,true)};
$('next').onclick=next;$('shuffle').onclick=()=>{shuffle=!shuffle;$('shuffle').textContent='셔플 '+(shuffle?'켜짐':'꺼짐')};
audio.onplay=()=>$('play').textContent='Ⅱ';audio.onpause=()=>$('play').textContent='▶';audio.onended=next;
audio.ontimeupdate=()=>{if(!audio.duration)return;$('seek').value=audio.currentTime/audio.duration*1000;$('elapsed').textContent=fmt(audio.currentTime);$('duration').textContent=fmt(audio.duration)};
$('seek').oninput=e=>{if(audio.duration)audio.currentTime=Number(e.target.value)/1000*audio.duration};
$('lyricsBtn').onclick=()=>$('lyrics').classList.toggle('hidden');
$('saveLyrics').onclick=()=>{if(current>=0){lyricsByName[playlist[current].name]=$('lyricsText').value;$('saveLyrics').textContent='저장됨';setTimeout(()=>$('saveLyrics').textContent='가사 저장',1200)}};
$('youtube').onclick=()=>window.open('https://www.youtube.com/','_blank','noopener');
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();