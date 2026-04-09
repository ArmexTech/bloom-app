import { useState, useEffect, useRef, useCallback } from "react";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --cream:#FAF7F2; --blush:#E8C4B8; --rose:#C4826A; --rose-dark:#A86B55;
    --deep:#3D2B2B; --sage:#8FA68E; --sage-light:#C8D8C7; --muted:#9E8A84;
    --warm-white:#FDF9F5; --water:#6AAAC4; --water-light:#D4EDF5;
    --dark-bg:#1A1010; --dark-card:#2A1818;
  }
  html, body { height:100%; }
  body { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--deep); min-height:100vh; overflow-x:hidden; }
  #root { display:flex; justify-content:center; min-height:100vh; background:#E8E0D8; }
  .app {
    width:100%; max-width:420px; min-height:100vh;
    background:var(--warm-white); position:relative; overflow-x:hidden;
    box-shadow:0 0 60px rgba(0,0,0,.15);
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes floatBig { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-12px) scale(1.04)} }
  @keyframes pop { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes poseBounce { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes glowPulse { 0%,100%{opacity:.25;transform:scale(.9)} 50%{opacity:.45;transform:scale(1.1)} }
  @keyframes badgePop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes sparkleFloat { 0%{opacity:0;transform:translateY(100vh) rotate(0deg)} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0;transform:translateY(-20px) rotate(360deg)} }
  @keyframes breathInhale { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.8);opacity:1} }
  @keyframes breathExhale { 0%,100%{transform:scale(1.8);opacity:1} 50%{transform:scale(1);opacity:.5} }
  @keyframes fillUp { from{height:0%} to{} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .animate { animation:fadeUp .4s ease both; }
  .d1{animation-delay:.05s} .d2{animation-delay:.1s} .d3{animation-delay:.15s}
  .d4{animation-delay:.2s}  .d5{animation-delay:.25s} .d6{animation-delay:.3s}

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    position:fixed; bottom:0; left:50%; transform:translateX(-50%);
    width:100%; max-width:420px; padding:12px 24px 24px;
    background:rgba(253,249,245,.95); backdrop-filter:blur(12px);
    border-top:1px solid #EDE3DD; display:flex; justify-content:space-around; z-index:100;
  }
  .nav-item { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; padding:4px 12px; border-radius:12px; transition:all .2s; }
  .nav-icon { font-size:22px; opacity:.4; transition:opacity .2s; }
  .nav-item.active .nav-icon { opacity:1; }
  .nav-label { font-size:10px; font-weight:500; color:var(--muted); letter-spacing:.3px; }
  .nav-item.active .nav-label { color:var(--rose); }
`;

// ─────────────────────────────────────────────
// SHARED NAV
// ─────────────────────────────────────────────
function BottomNav({ active, navigate }) {
  const items = [
    { icon:"🏠", label:"Home" },
    { icon:"🧘‍♀️", label:"Classes" },
    { icon:"🥗", label:"Nutrition" },
    { icon:"👤", label:"Profile" },
  ];
  return (
    <div className="bottom-nav">
      {items.map(item => (
        <div key={item.label} className={`nav-item ${active===item.label?"active":""}`} onClick={() => navigate(item.label)}>
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// QUIZ SCREEN
// ─────────────────────────────────────────────
const QUIZ_S = `
  .quiz-screen { min-height:100vh; display:flex; flex-direction:column; padding:48px 28px 36px; position:relative; animation:fadeUp .5s ease; }
  .quiz-bg { position:absolute; inset:0; background:linear-gradient(160deg,#FAF7F2 0%,#F0E4DC 60%,#E8D5CC 100%); z-index:0; }
  .quiz-blob { position:absolute; border-radius:50%; filter:blur(60px); opacity:.45; z-index:0; }
  .quiz-content { position:relative; z-index:1; flex:1; display:flex; flex-direction:column; }
  .progress-bar { display:flex; gap:6px; margin-bottom:48px; }
  .progress-dot { height:3px; flex:1; border-radius:2px; background:#DDD0CA; transition:background .4s; }
  .progress-dot.active { background:var(--rose); }
  .quiz-label { font-size:11px; font-weight:500; letter-spacing:2px; text-transform:uppercase; color:var(--rose); margin-bottom:12px; }
  .quiz-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:300; line-height:1.25; color:var(--deep); margin-bottom:8px; }
  .quiz-title em { font-style:italic; color:var(--rose); }
  .quiz-sub { font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:36px; }
  .option-grid { display:flex; flex-direction:column; gap:12px; flex:1; }
  .option-card { display:flex; align-items:center; gap:16px; padding:18px 20px; background:white; border:1.5px solid #EDE3DD; border-radius:16px; cursor:pointer; transition:all .25s; }
  .option-card:hover { border-color:var(--blush); transform:translateY(-2px); box-shadow:0 6px 24px rgba(196,130,106,.12); }
  .option-card.selected { border-color:var(--rose); background:linear-gradient(135deg,#FDF6F3,#FAF0EC); box-shadow:0 4px 20px rgba(196,130,106,.18); }
  .option-icon { font-size:24px; width:44px; height:44px; background:var(--cream); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .option-card.selected .option-icon { background:#FDE8DF; }
  .option-text h4 { font-size:15px; font-weight:500; color:var(--deep); margin-bottom:2px; }
  .option-text p { font-size:12px; color:var(--muted); line-height:1.4; }
  .quiz-btn { margin-top:28px; padding:17px; background:var(--deep); color:white; border:none; border-radius:16px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500; cursor:pointer; transition:all .25s; letter-spacing:.3px; }
  .quiz-btn:hover { background:var(--rose); transform:translateY(-1px); box-shadow:0 8px 24px rgba(196,130,106,.3); }
  .quiz-btn:disabled { opacity:.35; cursor:not-allowed; transform:none; box-shadow:none; background:var(--deep); }
  .welcome-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:48px 28px; background:linear-gradient(160deg,#F5EDE8 0%,#EDD8CE 50%,#DFC8BF 100%); animation:fadeUp .6s ease; }
  .welcome-logo { font-family:'Cormorant Garamond',serif; font-size:52px; font-weight:300; color:var(--deep); margin-bottom:4px; }
  .welcome-logo span { color:var(--rose); font-style:italic; }
  .welcome-tagline { font-size:13px; letter-spacing:2.5px; text-transform:uppercase; color:var(--muted); margin-bottom:48px; }
  .welcome-illustration { width:200px; height:200px; background:radial-gradient(circle,#E8C4B8 0%,rgba(196,130,106,.27) 60%,transparent 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:80px; margin:0 auto 48px; animation:float 4s ease-in-out infinite; }
  .welcome-title { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; color:var(--deep); margin-bottom:12px; line-height:1.3; }
  .welcome-sub { font-size:14px; color:var(--muted); line-height:1.7; margin-bottom:40px; max-width:300px; }
`;
const GOALS=[{id:"stress",icon:"🌿",label:"Reduce Stress",desc:"Calm your mind through mindful movement"},{id:"flex",icon:"🧘‍♀️",label:"Improve Flexibility",desc:"Open up and move with ease"},{id:"strength",icon:"💪",label:"Build Strength",desc:"Tone & strengthen your body gently"},{id:"sleep",icon:"🌙",label:"Better Sleep",desc:"Wind down with restorative routines"}];
const LEVELS=[{id:"beginner",icon:"🌱",label:"Complete Beginner",desc:"I'm new to yoga & wellness"},{id:"some",icon:"🌸",label:"Some Experience",desc:"I've tried it a few times"},{id:"regular",icon:"🌺",label:"Regular Practice",desc:"I practice a few times a week"}];
const TIME_PREFS=[{id:"morning",icon:"🌅",label:"Morning Ritual",desc:"Start the day with intention"},{id:"afternoon",icon:"☀️",label:"Afternoon Reset",desc:"A midday recharge"},{id:"evening",icon:"🌆",label:"Evening Wind-down",desc:"Decompress before bed"},{id:"anytime",icon:"✨",label:"Anytime",desc:"I'm flexible with my schedule"}];

function QuizScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const steps = [
    { label:"Your Goal", title:<>What brings you to <em>Bloom</em>?</>, sub:"We'll tailor your entire journey around what matters most to you.", key:"goal", options:GOALS },
    { label:"Your Level", title:<>Where are you in your <em>practice</em>?</>, sub:"There's no wrong answer — we'll meet you exactly where you are.", key:"level", options:LEVELS },
    { label:"Your Time", title:<>When do you love to <em>move</em>?</>, sub:"We'll schedule sessions that actually fit your life.", key:"time", options:TIME_PREFS },
  ];
  const cur = steps[step];
  const sel = answers[cur.key];
  const handleNext = () => {
    if (step < steps.length - 1) { setStep(s=>s+1); return; }
    setShowWelcome(true);
    setTimeout(onComplete, 2800);
  };
  if (showWelcome) return (
    <div className="app"><style>{QUIZ_S}</style>
      <div className="welcome-screen">
        <div className="welcome-logo">Bloom<span>.</span></div>
        <div className="welcome-tagline">Your wellness journey begins</div>
        <div className="welcome-illustration">🌸</div>
        <h2 className="welcome-title">Your plan is ready,<br />beautiful soul 🌿</h2>
        <p className="welcome-sub">We've created a personalised programme tailored just for you.</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {["Flexibility","Beginner","Personalised"].map(t=><span key={t} style={{padding:"6px 14px",background:"rgba(255,255,255,.6)",borderRadius:20,fontSize:12,color:"var(--deep)",fontWeight:500}}>{t}</span>)}
        </div>
      </div>
    </div>
  );
  return (
    <div className="app"><style>{QUIZ_S}</style>
      <div className="quiz-screen">
        <div className="quiz-bg"/>
        <div className="quiz-blob" style={{width:280,height:280,background:"#E8C4B8",top:-80,right:-80}}/>
        <div className="quiz-blob" style={{width:200,height:200,background:"#C8D8C7",bottom:60,left:-60}}/>
        <div className="quiz-content">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:36}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"var(--deep)"}}>Bloom<span style={{color:"var(--rose)",fontStyle:"italic"}}>.</span></span>
            <span style={{fontSize:13,color:"var(--muted)"}}>{step+1} of {steps.length}</span>
          </div>
          <div className="progress-bar">{steps.map((_,i)=><div key={i} className={`progress-dot ${i<=step?"active":""}`}/>)}</div>
          <div className="quiz-label">{cur.label}</div>
          <h2 className="quiz-title">{cur.title}</h2>
          <p className="quiz-sub">{cur.sub}</p>
          <div className="option-grid">
            {cur.options.map(opt=>(
              <div key={opt.id} className={`option-card ${sel===opt.id?"selected":""}`} onClick={()=>setAnswers(a=>({...a,[cur.key]:opt.id}))}>
                <div className="option-icon">{opt.icon}</div>
                <div className="option-text"><h4>{opt.label}</h4><p>{opt.desc}</p></div>
                {sel===opt.id&&<span style={{marginLeft:"auto",fontSize:18,color:"var(--rose)"}}>✓</span>}
              </div>
            ))}
          </div>
          <button className="quiz-btn" onClick={handleNext} disabled={!sel}>{step<steps.length-1?"Continue":"Build My Plan →"}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────
const HOME_S = `
  .home-header { padding:52px 24px 20px; background:linear-gradient(180deg,#FAF0EC 0%,transparent 100%); }
  .home-header-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
  .logo-small { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:400; color:var(--deep); }
  .logo-small span { color:var(--rose); font-style:italic; }
  .home-avatar { width:40px; height:40px; background:linear-gradient(135deg,var(--blush),var(--rose)); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; }
  .greeting { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:300; color:var(--deep); line-height:1.2; }
  .greeting em { font-style:italic; color:var(--rose); }
  .greeting-sub { font-size:13px; color:var(--muted); margin-top:4px; }
  .streak-card { margin:0 24px 20px; padding:18px 20px; background:linear-gradient(135deg,var(--deep) 0%,#5C3D3D 100%); border-radius:20px; display:flex; align-items:center; gap:16px; color:white; }
  .streak-icon { font-size:32px; }
  .streak-info h3 { font-size:20px; font-weight:600; }
  .streak-info p { font-size:12px; opacity:.65; margin-top:1px; }
  .streak-dots { margin-left:auto; display:flex; gap:5px; }
  .streak-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.25); }
  .streak-dot.done { background:var(--blush); }
  .section-header { display:flex; justify-content:space-between; align-items:baseline; padding:0 24px; margin-bottom:14px; }
  .section-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:var(--deep); }
  .section-link { font-size:12px; color:var(--rose); cursor:pointer; }
  .pills-row { display:flex; gap:8px; padding:0 24px; margin-bottom:20px; overflow-x:auto; scrollbar-width:none; }
  .pills-row::-webkit-scrollbar { display:none; }
  .pill { padding:8px 16px; border-radius:50px; font-size:13px; font-weight:500; cursor:pointer; white-space:nowrap; border:1.5px solid #EDE3DD; background:white; color:var(--muted); transition:all .2s; }
  .pill.active { background:var(--deep); border-color:var(--deep); color:white; }
  .cards-row { display:flex; gap:14px; padding:0 24px; overflow-x:auto; scrollbar-width:none; margin-bottom:28px; }
  .cards-row::-webkit-scrollbar { display:none; }
  .workout-card { flex-shrink:0; width:190px; border-radius:20px; overflow:hidden; cursor:pointer; transition:transform .25s,box-shadow .25s; }
  .workout-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(61,43,43,.15); }
  .workout-card-img { height:140px; display:flex; align-items:center; justify-content:center; font-size:52px; position:relative; }
  .card-duration { position:absolute; top:10px; right:10px; background:rgba(255,255,255,.9); padding:3px 8px; border-radius:20px; font-size:11px; font-weight:500; color:var(--deep); }
  .card-level { position:absolute; top:10px; left:10px; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; }
  .level-beginner { background:#D4EDDA; color:#2D6A4F; }
  .level-intermediate { background:#FFF3CD; color:#856404; }
  .level-advanced { background:#F8D7DA; color:#721C24; }
  .workout-card-body { padding:14px; background:white; border:1px solid #EDE3DD; border-top:none; border-radius:0 0 20px 20px; }
  .workout-card-body h4 { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:400; color:var(--deep); margin-bottom:4px; }
  .workout-card-body p { font-size:12px; color:var(--muted); }
  .today-list { padding:0 24px; display:flex; flex-direction:column; gap:10px; }
  .today-item { display:flex; align-items:center; gap:14px; padding:16px; background:white; border:1.5px solid #EDE3DD; border-radius:16px; cursor:pointer; transition:all .2s; }
  .today-item:hover { border-color:var(--blush); box-shadow:0 4px 16px rgba(196,130,106,.1); }
  .today-item.done { background:#F9F4F2; border-color:#E8D8D2; opacity:.7; }
  .today-icon { width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .today-info { flex:1; }
  .today-info h4 { font-size:14px; font-weight:500; color:var(--deep); margin-bottom:2px; }
  .today-info p { font-size:12px; color:var(--muted); }
  .today-check { width:26px; height:26px; border-radius:50%; border:2px solid #DDD0CA; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; transition:all .2s; cursor:pointer; }
  .today-check.checked { background:var(--sage); border-color:var(--sage); color:white; }
  .session-modal-overlay { position:fixed; inset:0; background:rgba(61,43,43,.5); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:flex-end; animation:fadeIn .3s ease; }
  .session-sheet { width:100%; max-width:420px; margin:0 auto; background:var(--warm-white); border-radius:28px 28px 0 0; padding:28px; animation:slideUp .4s cubic-bezier(.32,.72,0,1); }
  .sheet-handle { width:40px; height:4px; background:#DDD0CA; border-radius:2px; margin:0 auto 24px; }
  .sheet-start { width:100%; padding:17px; background:linear-gradient(135deg,var(--rose),var(--rose-dark)); color:white; border:none; border-radius:16px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500; cursor:pointer; margin-bottom:10px; transition:all .25s; }
  .sheet-start:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(196,130,106,.3); }
  .sheet-cancel { width:100%; padding:14px; background:transparent; color:var(--muted); border:none; font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; }
`;
const ALL_WORKOUTS=[
  {id:1,emoji:"🧘‍♀️",title:"Morning Flow",duration:"20 min",level:"beginner",category:"Yoga",desc:"A gentle sunrise flow to awaken the body.",bg:"linear-gradient(135deg,#FDE8DF 0%,#F5C9B8 100%)"},
  {id:2,emoji:"🌿",title:"Deep Stretch",duration:"30 min",level:"intermediate",category:"Flexibility",desc:"Release tension in hips, hamstrings and shoulders.",bg:"linear-gradient(135deg,#D4EDD4 0%,#B8D4B8 100%)"},
  {id:3,emoji:"🌙",title:"Bedtime Yoga",duration:"15 min",level:"beginner",category:"Wellness",desc:"Gentle poses designed to prepare you for restful sleep.",bg:"linear-gradient(135deg,#D9D4F0 0%,#C0B8E0 100%)"},
  {id:4,emoji:"🔥",title:"Core & Breathe",duration:"25 min",level:"intermediate",category:"Strength",desc:"Mindful core strengthening combined with breathwork.",bg:"linear-gradient(135deg,#FDECD4 0%,#F5D4A0 100%)"},
  {id:5,emoji:"💆‍♀️",title:"Stress Melt",duration:"20 min",level:"beginner",category:"Wellness",desc:"A calming sequence of restorative poses.",bg:"linear-gradient(135deg,#F5D4DC 0%,#E8B4C0 100%)"},
  {id:6,emoji:"🌸",title:"Hip Opening Flow",duration:"35 min",level:"advanced",category:"Flexibility",desc:"Deep hip openers to release emotional tension.",bg:"linear-gradient(135deg,#FFE4F0 0%,#FFBCD8 100%)"},
];
const TODAY_PLAN=[{id:1,emoji:"🧘‍♀️",title:"Morning Flow",duration:"20 min",time:"7:00 AM"},{id:2,emoji:"🌿",title:"Midday Stretch",duration:"10 min",time:"12:30 PM"},{id:3,emoji:"🌙",title:"Bedtime Yoga",duration:"15 min",time:"9:30 PM"}];

function HomeScreen({ navigate, activeNav, onStartSession }) {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState([]);
  const cats = ["All","Yoga","Flexibility","Wellness","Strength"];
  const visible = category==="All" ? ALL_WORKOUTS : ALL_WORKOUTS.filter(w=>w.category===category);
  return (
    <div className="app" style={{paddingBottom:100}}>
      <style>{HOME_S}</style>
      <div className="home-header">
        <div className="home-header-top">
          <div className="logo-small">Bloom<span>.</span></div>
          <div className="home-avatar">🌸</div>
        </div>
        <div className="greeting">Good morning,<br /><em>radiant one</em> ☀️</div>
        <div className="greeting-sub">Ready for today's flow?</div>
      </div>
      <div className="streak-card animate d1">
        <div className="streak-icon">🔥</div>
        <div className="streak-info"><h3>5 Day Streak</h3><p>Keep it going — you're on a roll!</p></div>
        <div className="streak-dots">{[0,1,2,3,4,5,6].map(i=><div key={i} className={`streak-dot ${i<5?"done":""}`}/>)}</div>
      </div>
      <div className="section-header animate d2"><div className="section-title">Today's Plan</div><span className="section-link">View all</span></div>
      <div className="today-list" style={{marginBottom:28}}>
        {TODAY_PLAN.map(item=>(
          <div key={item.id} className={`today-item ${done.includes(item.id)?"done":""}`}>
            <div className="today-icon" style={{background:done.includes(item.id)?"#EDF5ED":"#FDE8DF"}}>{item.emoji}</div>
            <div className="today-info"><h4>{item.title}</h4><p>{item.time} · {item.duration}</p></div>
            <div className={`today-check ${done.includes(item.id)?"checked":""}`} onClick={()=>setDone(d=>d.includes(item.id)?d.filter(x=>x!==item.id):[...d,item.id])}>{done.includes(item.id)?"✓":""}</div>
          </div>
        ))}
      </div>
      <div className="section-header animate d3"><div className="section-title">Explore</div><span className="section-link">All classes</span></div>
      <div className="pills-row">{cats.map(c=><div key={c} className={`pill ${category===c?"active":""}`} onClick={()=>setCategory(c)}>{c}</div>)}</div>
      <div className="cards-row">
        {visible.map(w=>(
          <div key={w.id} className="workout-card" onClick={()=>setSelected(w)}>
            <div className="workout-card-img" style={{background:w.bg}}>
              {w.emoji}
              <span className="card-duration">{w.duration}</span>
              <span className={`card-level level-${w.level}`}>{w.level}</span>
            </div>
            <div className="workout-card-body"><h4>{w.title}</h4><p>{w.category}</p></div>
          </div>
        ))}
      </div>
      <BottomNav active={activeNav} navigate={navigate} />
      {selected && (
        <div className="session-modal-overlay" onClick={()=>setSelected(null)}>
          <div className="session-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{fontSize:52,marginBottom:12}}>{selected.emoji}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,marginBottom:6}}>{selected.title}</div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              {[`⏱ ${selected.duration}`,`📌 ${selected.category}`,selected.level].map(t=><span key={t} style={{padding:"5px 12px",background:"var(--cream)",borderRadius:20,fontSize:12,color:"var(--muted)",fontWeight:500}}>{t}</span>)}
            </div>
            <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.7,marginBottom:28}}>{selected.desc}</p>
            <button className="sheet-start" onClick={()=>{ setSelected(null); onStartSession(); }}>Begin Session ✨</button>
            <button className="sheet-cancel" onClick={()=>setSelected(null)}>Maybe later</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SESSION PLAYER
// ─────────────────────────────────────────────
const PLAYER_S = `
  .player { min-height:100vh; display:flex; flex-direction:column; position:relative; animation:fadeIn .4s ease; }
  .player-bg { position:absolute; inset:0; transition:background 1.2s ease; }
  .player-top { position:relative; z-index:2; padding:52px 24px 20px; display:flex; align-items:center; justify-content:space-between; }
  .session-progress-bar { flex:1; height:3px; background:rgba(255,255,255,.15); border-radius:2px; margin:0 16px; overflow:hidden; }
  .session-progress-fill { height:100%; background:rgba(255,255,255,.8); border-radius:2px; transition:width .5s ease; }
  .session-count { font-size:13px; color:rgba(255,255,255,.5); white-space:nowrap; }
  .pause-btn { width:36px; height:36px; background:rgba(255,255,255,.12); border:none; border-radius:50%; color:white; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .pose-stage { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; z-index:2; padding:0 28px; }
  .pose-emoji-wrap { position:relative; margin-bottom:28px; }
  .pose-glow { position:absolute; inset:-30px; border-radius:50%; filter:blur(40px); opacity:.35; animation:glowPulse 3s ease-in-out infinite; }
  .pose-emoji { font-size:100px; display:block; position:relative; z-index:1; animation:poseBounce .5s cubic-bezier(.34,1.56,.64,1); filter:drop-shadow(0 10px 30px rgba(0,0,0,.4)); }
  .pose-name { font-family:'Cormorant Garamond',serif; font-size:36px; font-weight:300; text-align:center; margin-bottom:8px; line-height:1.2; color:white; }
  .pose-name em { font-style:italic; color:var(--blush); }
  .pose-instruction { font-size:14px; color:rgba(255,255,255,.55); text-align:center; line-height:1.7; max-width:280px; margin-bottom:36px; }
  .timer-wrap { display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:28px; }
  .timer-ring { position:relative; width:110px; height:110px; }
  .timer-svg { transform:rotate(-90deg); position:absolute; inset:0; }
  .timer-track { fill:none; stroke:rgba(255,255,255,.1); stroke-width:4; }
  .timer-fill { fill:none; stroke-width:4; stroke-linecap:round; transition:stroke-dashoffset 1s linear,stroke .5s ease; }
  .timer-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .timer-num { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; line-height:1; color:white; }
  .timer-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.4); margin-top:2px; }
  .breath-guide { display:flex; align-items:center; gap:10px; padding:10px 18px; background:rgba(255,255,255,.07); border-radius:50px; border:1px solid rgba(255,255,255,.1); }
  .breath-dot { width:8px; height:8px; border-radius:50%; background:var(--blush); }
  .breath-text { font-size:13px; color:rgba(255,255,255,.6); letter-spacing:.5px; }
  .player-controls { position:relative; z-index:2; padding:0 24px 44px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .ctrl-btn { width:52px; height:52px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px; color:rgba(255,255,255,.7); transition:all .2s; }
  .ctrl-btn.primary { width:68px; height:68px; background:white; border-color:white; color:var(--deep); font-size:24px; box-shadow:0 8px 28px rgba(0,0,0,.3); }
  .rest-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 28px; background:linear-gradient(160deg,#1A2A1A 0%,#0F1F0F 100%); text-align:center; animation:fadeIn .5s ease; position:relative; }
  .rest-blob { position:absolute; width:300px; height:300px; background:radial-gradient(circle,rgba(143,166,142,.3) 0%,transparent 70%); border-radius:50%; animation:glowPulse 3s ease-in-out infinite; }
  .rest-title { font-family:'Cormorant Garamond',serif; font-size:42px; font-weight:300; color:var(--sage-light); margin-bottom:8px; }
  .rest-sub { font-size:14px; color:rgba(255,255,255,.45); line-height:1.7; margin-bottom:36px; max-width:260px; }
  .rest-timer { font-family:'Cormorant Garamond',serif; font-size:72px; font-weight:300; color:var(--sage-light); margin-bottom:8px; line-height:1; }
  .rest-timer-label { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.3); margin-bottom:32px; }
  .complete-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 28px; text-align:center; position:relative; overflow:hidden; animation:fadeIn .6s ease; }
  .confetti-bg { position:absolute; inset:0; background:linear-gradient(160deg,#2A1A1A 0%,#1A1020 50%,#0A1A10 100%); }
  .sparkle { position:absolute; animation:sparkleFloat linear infinite; opacity:0; }
  .complete-badge { width:120px; height:120px; background:linear-gradient(135deg,var(--rose),var(--rose-dark)); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:52px; margin:0 auto 24px; box-shadow:0 0 60px rgba(196,130,106,.5); animation:badgePop .6s cubic-bezier(.34,1.56,.64,1); }
  .complete-title { font-family:'Cormorant Garamond',serif; font-size:42px; font-weight:300; margin-bottom:6px; color:white; }
  .complete-title em { font-style:italic; color:var(--blush); }
  .mood-btn { width:52px; height:52px; background:rgba(255,255,255,.06); border:1.5px solid rgba(255,255,255,.1); border-radius:50%; font-size:24px; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; }
  .mood-btn:hover,.mood-btn.selected { background:rgba(196,130,106,.2); border-color:var(--rose); transform:scale(1.12); }
  .pause-overlay { position:fixed; inset:0; background:rgba(10,5,5,.85); backdrop-filter:blur(8px); z-index:100; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; animation:fadeIn .3s ease; }
  .lobby-screen { min-height:100vh; display:flex; flex-direction:column; position:relative; animation:fadeUp .5s ease; background:var(--dark-bg); }
  .lobby-hero { height:52vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .lobby-bg { position:absolute; inset:0; background:linear-gradient(160deg,#3D1A1A 0%,#2A1010 50%,#1A1A2A 100%); }
  .lobby-emoji { font-size:90px; position:relative; z-index:1; animation:floatBig 5s ease-in-out infinite; filter:drop-shadow(0 0 40px rgba(196,130,106,.4)); }
  .lobby-content { flex:1; padding:0 28px 40px; display:flex; flex-direction:column; }
  .start-btn { width:100%; padding:18px; background:linear-gradient(135deg,var(--rose) 0%,var(--rose-dark) 100%); color:white; border:none; border-radius:18px; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:600; cursor:pointer; box-shadow:0 8px 32px rgba(196,130,106,.35); transition:all .25s; }
  .start-btn:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(196,130,106,.45); }
  .back-btn { position:absolute; top:52px; left:24px; z-index:10; width:40px; height:40px; background:rgba(255,255,255,.1); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.15); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; color:white; }
`;
const SESSION_POSES=[
  {id:1,emoji:"🌅",name:"Mountain Pose",sanskrit:"Tadasana",duration:30,instruction:"Stand tall, feet hip-width. Ground down through all four corners. Breathe deeply.",bg:"linear-gradient(160deg,#3D1A0A 0%,#1A0D05 100%)",glow:"#C4826A"},
  {id:2,emoji:"🙆‍♀️",name:"Forward Fold",sanskrit:"Uttanasana",duration:35,instruction:"Hinge at hips, let your head hang heavy. Bend your knees generously.",bg:"linear-gradient(160deg,#0A1A3D 0%,#051020 100%)",glow:"#6A8AC4"},
  {id:3,emoji:"🌿",name:"Cat-Cow Flow",sanskrit:"Marjaryasana",duration:40,instruction:"On hands and knees. Inhale — arch. Exhale — round. Move with your breath.",bg:"linear-gradient(160deg,#0A3D1A 0%,#051A0D 100%)",glow:"#6AC48A"},
  {id:4,emoji:"🦢",name:"Downward Dog",sanskrit:"Adho Mukha",duration:35,instruction:"Press hands into mat. Lift hips high. Pedal gently through your heels.",bg:"linear-gradient(160deg,#3D1A3D 0%,#1A0520 100%)",glow:"#C46AC4"},
  {id:5,emoji:"🌸",name:"Low Lunge",sanskrit:"Anjaneyasana",duration:30,instruction:"Step right foot forward. Sink your hips. Open chest toward the sky.",bg:"linear-gradient(160deg,#3D0A1A 0%,#200510 100%)",glow:"#C46A8A"},
  {id:6,emoji:"✨",name:"Warrior II",sanskrit:"Virabhadrasana II",duration:35,instruction:"Open hips to the side. Arms parallel to the floor. Gaze over front fingertips.",bg:"linear-gradient(160deg,#3D2A0A 0%,#201505 100%)",glow:"#C4A06A"},
  {id:7,emoji:"🕊️",name:"Child's Pose",sanskrit:"Balasana",duration:45,instruction:"Knees wide, big toes touching. Melt your forehead to the mat. Full surrender.",bg:"linear-gradient(160deg,#1A3D3D 0%,#0A2020 100%)",glow:"#6AC4C4"},
  {id:8,emoji:"🌙",name:"Savasana",sanskrit:"Corpse Pose",duration:60,instruction:"Lie flat, palms up. Let go of all effort. Simply be.",bg:"linear-gradient(160deg,#0A0A1A 0%,#050510 100%)",glow:"#8A8AC4"},
];
const REST_MSGS=["Breathe. You're doing beautifully ✨","Soften your shoulders 🌿","You're stronger than you know 💫","Keep flowing, radiant one 🌸"];
function useBreath(){
  const [phase,setPhase]=useState("Inhale");
  useEffect(()=>{
    const cycle=["Inhale","Hold","Exhale","Rest"],times=[4000,1500,4000,1500];
    let idx=0;
    const run=()=>{ const t=setTimeout(()=>{ idx=(idx+1)%4; setPhase(cycle[idx]); run(); },times[idx]); return t; };
    const t=run(); return ()=>clearTimeout(t);
  },[]);
  return phase;
}
function RingTimer({seconds,total,color="#C4826A"}){
  const r=46,circ=2*Math.PI*r,offset=circ-(seconds/total)*circ;
  return(
    <div className="timer-ring">
      <svg className="timer-svg" width="110" height="110" viewBox="0 0 110 110">
        <circle className="timer-track" cx="55" cy="55" r={r}/>
        <circle className="timer-fill" cx="55" cy="55" r={r} stroke={color} strokeDasharray={circ} strokeDashoffset={offset}/>
      </svg>
      <div className="timer-center"><span className="timer-num">{seconds}</span><span className="timer-label">secs</span></div>
    </div>
  );
}
function Sparkles(){
  const items=["✨","🌸","💫","🌿","⭐","🌺","💗","🌟"];
  return <>{Array.from({length:18}).map((_,i)=><div key={i} className="sparkle" style={{left:`${Math.random()*100}%`,animationDuration:`${3+Math.random()*4}s`,animationDelay:`${Math.random()*4}s`,fontSize:`${14+Math.random()*14}px`}}>{items[i%items.length]}</div>)}</>;
}

function SessionPlayer({ onBack }) {
  const [view, setView] = useState("lobby");
  const [poseIdx, setPoseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restTime, setRestTime] = useState(8);
  const [mood, setMood] = useState(null);
  const ref = useRef(null);
  const breathPhase = useBreath();
  const pose = SESSION_POSES[poseIdx];
  const isLast = poseIdx === SESSION_POSES.length - 1;
  const clearTick = () => { if(ref.current) clearInterval(ref.current); };
  const startPose = useCallback(idx => {
    clearTick(); setPoseIdx(idx); setTimeLeft(SESSION_POSES[idx].duration); setView("player");
  },[]);
  const startRest = useCallback(()=>{ clearTick(); setRestTime(8); setView("rest"); },[]);
  useEffect(()=>{
    if(view!=="player"||paused) return;
    ref.current=setInterval(()=>setTimeLeft(t=>{ if(t<=1){ clearInterval(ref.current); isLast?setView("complete"):startRest(); return 0; } return t-1; }),1000);
    return clearTick;
  },[view,paused,poseIdx,isLast,startRest]);
  useEffect(()=>{
    if(view!=="rest") return;
    ref.current=setInterval(()=>setRestTime(t=>{ if(t<=1){ clearInterval(ref.current); startPose(poseIdx+1); return 0; } return t-1; }),1000);
    return clearTick;
  },[view,poseIdx,startPose]);
  const ringR=46,ringCirc=2*Math.PI*ringR,ringOffset=ringCirc-(timeLeft/pose?.duration)*ringCirc;
  const breathColor={Inhale:"#8FA68E",Hold:"#C4826A",Exhale:"#6A8AC4",Rest:"#C4C46A"}[breathPhase]||"#C4826A";

  if(view==="lobby") return(
    <div className="app" style={{background:"var(--dark-bg)",color:"white"}}>
      <style>{PLAYER_S}</style>
      <button className="back-btn" onClick={onBack}>←</button>
      <div className="lobby-screen">
        <div className="lobby-hero">
          <div className="lobby-bg"/>
          <div className="lobby-emoji">🧘‍♀️</div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:120,background:"linear-gradient(to top,var(--dark-bg),transparent)"}}/>
        </div>
        <div className="lobby-content">
          <div style={{fontSize:11,letterSpacing:2.5,textTransform:"uppercase",color:"var(--rose)",fontWeight:600,marginBottom:10}}>Yoga · Beginner</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:300,marginBottom:10,color:"white"}}>Morning <em style={{fontStyle:"italic",color:"var(--blush)"}}>Flow</em></h1>
          <p style={{fontSize:14,color:"rgba(255,255,255,.5)",lineHeight:1.7,marginBottom:24}}>A gentle sunrise sequence to awaken body and mind. Perfect for starting your day with calm intention.</p>
          <div style={{display:"flex",gap:10,marginBottom:28}}>
            {[{v:SESSION_POSES.length,l:"Poses"},{v:"20",l:"Minutes"},{v:"~80",l:"Calories"}].map(s=>(
              <div key={s.l} style={{flex:1,padding:14,background:"var(--dark-card)",borderRadius:14,border:"1px solid rgba(255,255,255,.07)",textAlign:"center"}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:"var(--blush)",display:"block"}}>{s.v}</span>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:28}}>
            <h4 style={{fontSize:12,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(255,255,255,.35)",marginBottom:12}}>Session poses</h4>
            <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
              {SESSION_POSES.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 13px",background:"var(--dark-card)",border:"1px solid rgba(255,255,255,.08)",borderRadius:50,whiteSpace:"nowrap",fontSize:12,color:"rgba(255,255,255,.6)",flexShrink:0}}><span>{p.emoji}</span><span>{p.name}</span></div>)}
            </div>
          </div>
          <button className="start-btn" onClick={()=>startPose(0)}>Begin Session ✨</button>
        </div>
      </div>
    </div>
  );

  if(view==="rest") return(
    <div className="app" style={{color:"white"}}>
      <style>{PLAYER_S}</style>
      <div className="rest-screen">
        <div className="rest-blob"/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          <span style={{fontSize:72,marginBottom:20,display:"block"}}>🌿</span>
          <div className="rest-title">Rest & Breathe</div>
          <p className="rest-sub">{REST_MSGS[poseIdx%REST_MSGS.length]}</p>
          <div className="rest-timer">{restTime}</div>
          <div className="rest-timer-label">seconds of rest</div>
          {SESSION_POSES[poseIdx+1]&&<div style={{padding:"14px 20px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,display:"flex",alignItems:"center",gap:12,maxWidth:300,margin:"0 auto"}}>
            <span style={{fontSize:28}}>{SESSION_POSES[poseIdx+1].emoji}</span>
            <div><div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:2}}>Up next</div><div style={{fontSize:15,fontWeight:500,color:"rgba(255,255,255,.8)"}}>{SESSION_POSES[poseIdx+1].name}</div></div>
          </div>}
        </div>
      </div>
    </div>
  );

  if(view==="complete") return(
    <div className="app" style={{color:"white"}}>
      <style>{PLAYER_S}</style>
      <div className="complete-screen">
        <div className="confetti-bg"/><Sparkles/>
        <div style={{position:"relative",zIndex:1}}>
          <div className="complete-badge">🏅</div>
          <h2 className="complete-title">You <em>did it,</em><br/>beautiful! 🌸</h2>
          <p style={{fontSize:15,color:"rgba(255,255,255,.5)",lineHeight:1.7,marginBottom:36,maxWidth:280}}>That was {SESSION_POSES.length} poses of pure grace. Your body and mind thank you.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:32,width:"100%",maxWidth:360}}>
            {[{v:"20",l:"Minutes"},{v:SESSION_POSES.length,l:"Poses"},{v:"~82",l:"Calories"}].map(s=>(
              <div key={s.l} style={{padding:"16px 10px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,textAlign:"center"}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:"var(--blush)",display:"block",marginBottom:3}}>{s.v}</span>
                <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:32,width:"100%",maxWidth:360}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:12,letterSpacing:.5}}>How do you feel? 💫</div>
            <div style={{display:"flex",justifyContent:"center",gap:10}}>
              {["😔","😐","🙂","😊","🤩"].map((m,i)=><button key={i} className={`mood-btn ${mood===i?"selected":""}`} onClick={()=>setMood(i)}>{m}</button>)}
            </div>
          </div>
          <button style={{width:"100%",maxWidth:360,padding:18,background:"linear-gradient(135deg,var(--rose),var(--rose-dark))",color:"white",border:"none",borderRadius:18,fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:"0 8px 32px rgba(196,130,106,.35)"}} onClick={onBack}>Back to Home →</button>
        </div>
      </div>
    </div>
  );

  return(
    <div className="app" style={{color:"white"}}>
      <style>{PLAYER_S}</style>
      <div className="player">
        <div className="player-bg" style={{background:pose.bg}}/>
        <div className="player-top">
          <button className="pause-btn" onClick={()=>setPaused(p=>!p)}>{paused?"▶":"⏸"}</button>
          <div className="session-progress-bar"><div className="session-progress-fill" style={{width:`${(poseIdx/SESSION_POSES.length)*100}%`}}/></div>
          <span className="session-count">{poseIdx+1} / {SESSION_POSES.length}</span>
        </div>
        <div className="pose-stage">
          <div className="pose-emoji-wrap">
            <div className="pose-glow" style={{background:pose.glow}}/>
            <span className="pose-emoji" key={poseIdx}>{pose.emoji}</span>
          </div>
          <h2 className="pose-name" key={`n${poseIdx}`}>{pose.name}<br/><em>{pose.sanskrit}</em></h2>
          <p className="pose-instruction">{pose.instruction}</p>
          <div className="timer-wrap">
            <RingTimer seconds={timeLeft} total={pose.duration} color={pose.glow}/>
            <div className="breath-guide">
              <div className="breath-dot" style={{background:breathColor,animation:`${breathPhase==="Inhale"?"breathInhale":"breathExhale"} 4s ease-in-out infinite`}}/>
              <span className="breath-text">{breathPhase}</span>
            </div>
          </div>
        </div>
        <div className="player-controls">
          <button className="ctrl-btn" onClick={()=>poseIdx>0&&startPose(poseIdx-1)} style={{opacity:poseIdx===0?.3:1}}>⏮</button>
          <button className="ctrl-btn primary" onClick={()=>setPaused(p=>!p)}>{paused?"▶":"⏸"}</button>
          <button className="ctrl-btn" onClick={()=>isLast?setView("complete"):startRest()}>⏭</button>
        </div>
        {paused&&<div className="pause-overlay">
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:300,color:"var(--blush)",marginBottom:8}}>Paused 🌿</div>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:14,marginBottom:24}}>Take all the time you need.</p>
          <button style={{width:260,padding:16,background:"var(--rose)",color:"white",border:"none",borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:8}} onClick={()=>setPaused(false)}>▶ Resume</button>
          <button style={{width:260,padding:16,background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.6)",border:"none",borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:14,cursor:"pointer"}} onClick={onBack}>End Session</button>
        </div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROGRESS & PROFILE
// ─────────────────────────────────────────────
const PROG_S = `
  .profile-hero { padding:52px 24px 28px; background:linear-gradient(160deg,#FAF0EC 0%,#F5E8E0 60%,#EDD8CC 100%); position:relative; overflow:hidden; }
  .hero-blob { position:absolute; border-radius:50%; filter:blur(60px); opacity:.35; pointer-events:none; }
  .avatar-ring { width:78px; height:78px; border-radius:50%; background:linear-gradient(135deg,var(--blush),var(--rose)); display:flex; align-items:center; justify-content:center; font-size:34px; flex-shrink:0; box-shadow:0 4px 20px rgba(196,130,106,.35); position:relative; }
  .avatar-badge { position:absolute; bottom:-2px; right:-2px; width:24px; height:24px; background:var(--deep); border-radius:50%; border:2px solid var(--warm-white); display:flex; align-items:center; justify-content:center; font-size:11px; color:white; }
  .level-card { margin:20px 24px 0; padding:20px; background:linear-gradient(135deg,var(--deep) 0%,#5C3D3D 100%); border-radius:22px; color:white; }
  .level-bar-track { height:6px; background:rgba(255,255,255,.15); border-radius:3px; margin-bottom:8px; overflow:hidden; }
  .level-bar-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--blush),var(--rose)); transition:width 1.2s cubic-bezier(.4,0,.2,1); }
  .tab-bar { display:flex; border-bottom:1.5px solid #EDE3DD; background:var(--warm-white); position:sticky; top:0; z-index:50; padding:0 24px; }
  .tab { flex:1; padding:14px 0; text-align:center; font-size:13px; font-weight:500; color:var(--muted); cursor:pointer; border-bottom:2.5px solid transparent; margin-bottom:-1.5px; transition:all .2s; }
  .tab.active { color:var(--rose); border-bottom-color:var(--rose); }
  .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0 24px; margin-bottom:24px; }
  .stat-tile { padding:18px 16px; background:white; border:1.5px solid #EDE3DD; border-radius:18px; }
  .stat-tile-val { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; color:var(--deep); line-height:1; display:block; }
  .stat-tile-label { font-size:12px; color:var(--muted); margin-top:3px; }
  .week-chart { display:flex; align-items:flex-end; gap:6px; height:80px; }
  .week-bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; }
  .week-bar-track { flex:1; width:100%; background:#F0E8E4; border-radius:6px; overflow:hidden; position:relative; min-height:60px; }
  .week-bar-fill { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top,var(--rose),var(--blush)); border-radius:6px; transition:height 1s cubic-bezier(.4,0,.2,1); }
  .week-bar-fill.today { background:linear-gradient(to top,var(--deep),#7A5555); }
  .week-label { font-size:10px; color:var(--muted); font-weight:500; }
  .achievements-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .achievement { padding:16px 10px; background:white; border:1.5px solid #EDE3DD; border-radius:16px; text-align:center; transition:all .25s; position:relative; overflow:hidden; }
  .achievement.unlocked { border-color:var(--blush); }
  .achievement.locked { opacity:.45; filter:grayscale(.6); }
  .settings-item { display:flex; align-items:center; gap:14px; padding:16px; background:white; border:1.5px solid #EDE3DD; border-radius:16px; cursor:pointer; transition:all .2s; margin-bottom:8px; }
  .settings-item:hover { border-color:var(--blush); }
  .settings-toggle { width:44px; height:24px; border-radius:12px; background:var(--sage); position:relative; cursor:pointer; flex-shrink:0; transition:background .3s; }
  .settings-toggle::after { content:''; position:absolute; width:18px; height:18px; border-radius:50%; background:white; top:3px; right:3px; transition:right .3s,left .3s; box-shadow:0 1px 4px rgba(0,0,0,.2); }
  .settings-toggle.off { background:#DDD0CA; }
  .settings-toggle.off::after { right:auto; left:3px; }
  .history-item { display:flex; align-items:center; gap:14px; padding:14px 16px; background:white; border:1.5px solid #EDE3DD; border-radius:16px; margin-bottom:8px; animation:slideDown .3s ease; }
  .history-item:hover { border-color:var(--blush); }
`;
const WEEK_DATA=[{day:"M",mins:20},{day:"T",mins:35},{day:"W",mins:0},{day:"T",mins:25},{day:"F",mins:30},{day:"S",mins:15},{day:"S",mins:0,today:true}];
const maxM=Math.max(...WEEK_DATA.map(d=>d.mins),1);
const HISTORY=[{id:1,emoji:"🧘‍♀️",title:"Morning Flow",cat:"Yoga",date:"Today, 7:14 AM",dur:20,cal:82,mood:"😊",bg:"#FDE8DF"},{id:2,emoji:"🌿",title:"Deep Stretch",cat:"Flexibility",date:"Yesterday",dur:30,cal:95,mood:"🤩",bg:"#D4EDD4"},{id:3,emoji:"🔥",title:"Core & Breathe",cat:"Strength",date:"Fri, 8:00 AM",dur:25,cal:110,mood:"😊",bg:"#FDECD4"},{id:4,emoji:"💆‍♀️",title:"Stress Melt",cat:"Wellness",date:"Thu, 9:30 PM",dur:20,cal:60,mood:"🙂",bg:"#F5D4DC"},{id:5,emoji:"🌙",title:"Bedtime Yoga",cat:"Yoga",date:"Wed, 9:15 PM",dur:15,cal:45,mood:"🤩",bg:"#D9D4F0"}];
const ACHIEVEMENTS_DATA=[{emoji:"🌱",name:"First Flow",desc:"Complete your first session",unlocked:true,isNew:false},{emoji:"🔥",name:"3-Day Streak",desc:"Practice 3 days in a row",unlocked:true,isNew:false},{emoji:"⭐",name:"Week Warrior",desc:"7 sessions in a week",unlocked:true,isNew:true},{emoji:"🧘‍♀️",name:"Zen Master",desc:"Hold a pose 60 seconds",unlocked:true,isNew:false},{emoji:"🌸",name:"Flex Queen",desc:"5 flexibility sessions",unlocked:false,isNew:false},{emoji:"💪",name:"Strength",desc:"3 strength sessions",unlocked:false,isNew:false},{emoji:"🌙",name:"Night Owl",desc:"5 evening sessions",unlocked:false,isNew:false},{emoji:"🏅",name:"30-Day Bloom",desc:"Practice every day/month",unlocked:false,isNew:false},{emoji:"💫",name:"Mindful",desc:"Log mood every session",unlocked:false,isNew:false}];
const GOALS_DATA=[{emoji:"🧘‍♀️",label:"Flexibility",current:12,target:20,color:"#C4826A"},{emoji:"💪",label:"Strength",current:4,target:10,color:"#8FA68E"},{emoji:"🌙",label:"Sleep Quality",current:7,target:7,color:"#9B8AC4"},{emoji:"🔥",label:"Streak Goal",current:5,target:21,color:"#C4A06A"}];
function AnimNum({val}){
  const [d,setD]=useState(0);const r=useRef(null);
  useEffect(()=>{ let s=0; const step=Math.ceil(val/30); clearInterval(r.current); r.current=setInterval(()=>{ s=Math.min(s+step,val); setD(s); if(s>=val)clearInterval(r.current); },30); return()=>clearInterval(r.current); },[val]);
  return <>{d}</>;
}

function ProgressScreen({ navigate, activeNav }) {
  const [tab, setTab] = useState("progress");
  const [toggles, setToggles] = useState({0:true,2:true,3:false});
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);
  const SETTINGS=[{emoji:"🔔",label:"Notifications",sub:"Daily reminders & streak alerts",toggle:true},{emoji:"🌅",label:"Morning Reminder",sub:"7:00 AM every day",toggle:false},{emoji:"🎵",label:"Session Sounds",sub:"Ambient music & bell cues",toggle:true},{emoji:"📊",label:"Weekly Reports",sub:"Progress summary Sundays",toggle:true},{emoji:"🔒",label:"Privacy Settings",sub:"Data & account security",toggle:false},{emoji:"💳",label:"Subscription",sub:"Bloom Premium · Renews Apr 2027",toggle:false}];
  return(
    <div className="app" style={{paddingBottom:100}}>
      <style>{PROG_S}</style>
      <div className="profile-hero">
        <div className="hero-blob" style={{width:240,height:240,background:"#E8C4B8",top:-60,right:-60}}/>
        <div className="hero-blob" style={{width:160,height:160,background:"#C8D8C7",bottom:-30,left:-30}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:18}}>
          <div className="avatar-ring">🌸<div className="avatar-badge">✏️</div></div>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:"var(--deep)"}}>Sophia <em style={{fontStyle:"italic",color:"var(--rose)"}}>Clarke</em></div>
            <div style={{fontSize:13,color:"var(--muted)",marginTop:3}}>Member since March 2025 · 🌍 London</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",background:"rgba(196,130,106,.12)",borderRadius:50,fontSize:12,color:"var(--rose)",fontWeight:500,marginTop:10}}>🎯 Flexibility & Stress Relief</div>
          </div>
        </div>
      </div>
      <div className="level-card animate d1">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div><div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",opacity:.45,marginBottom:4}}>Current Level</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300}}>🌸 Rising Bloomer</div></div>
          <div style={{padding:"4px 12px",background:"rgba(255,255,255,.12)",borderRadius:50,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Level 4</div>
        </div>
        <div className="level-bar-track"><div className="level-bar-fill" style={{width:mounted?"68%":"0%"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,opacity:.5}}><span>1,240 XP</span><span>Next: 🌺 Full Bloom at 1,500 XP</span></div>
      </div>
      <div className="tab-bar">
        {["progress","history","achievements","profile"].map(t=><div key={t} className={`tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}
      </div>
      <div>
        {tab==="progress"&&<>
          <div style={{height:20}}/>
          <div className="stat-grid animate d1">
            {[{icon:"🔥",val:5,label:"Day Streak"},{icon:"🧘‍♀️",val:24,label:"Sessions Done"},{icon:"⏱",val:480,label:"Total Minutes"},{icon:"🌿",val:1920,label:"XP Earned"}].map((s,i)=>(
              <div className="stat-tile" key={i}>
                <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
                <span className="stat-tile-val">{mounted?<AnimNum val={s.val}/>:0}</span>
                <div className="stat-tile-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"0 24px",marginBottom:28}} className="animate d2">
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--rose)",fontWeight:600,marginBottom:6}}>This Week</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:14}}>Activity</div>
            <div className="week-chart">
              {WEEK_DATA.map((d,i)=>(
                <div className="week-bar-wrap" key={i}>
                  <div className="week-bar-track"><div className={`week-bar-fill${d.today?" today":""}`} style={{height:mounted?`${(d.mins/maxM)*100}%`:"0%"}}/></div>
                  <div className="week-label" style={{color:d.today?"var(--rose)":""}}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:"0 24px",marginBottom:28}} className="animate d3">
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--rose)",fontWeight:600,marginBottom:6}}>Monthly Goals</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:14}}>Your Targets</div>
            {GOALS_DATA.map((g,i)=>{ const pct=Math.round((g.current/g.target)*100); return(
              <div key={i} style={{padding:16,background:"white",border:"1.5px solid #EDE3DD",borderRadius:16,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:500}}><span>{g.emoji}</span>{g.label}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"var(--rose)"}}>{pct}%</div>
                </div>
                <div style={{height:6,background:"#F0E8E4",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:g.color,width:mounted?`${pct}%`:"0%",transition:"width 1.2s"}}/></div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:6}}>{g.current} of {g.target} · {g.target-g.current} to go</div>
              </div>
            );})}
          </div>
        </>}
        {tab==="history"&&<div style={{padding:"20px 24px"}}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--rose)",fontWeight:600,marginBottom:6}}>All Sessions</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:14}}>Your Journey</div>
          {HISTORY.map(h=>(
            <div className="history-item" key={h.id}>
              <div style={{width:46,height:46,borderRadius:14,background:h.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{h.emoji}</div>
              <div style={{flex:1}}><h4 style={{fontSize:14,fontWeight:500,color:"var(--deep)",marginBottom:3}}>{h.title}</h4><p style={{fontSize:12,color:"var(--muted)"}}>{h.cat} · {h.date}</p></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"var(--deep)"}}>{h.dur}m</div><div style={{fontSize:11,color:"var(--muted)"}}>{h.cal} cal</div><div style={{fontSize:18}}>{h.mood}</div></div>
            </div>
          ))}
        </div>}
        {tab==="achievements"&&<div style={{padding:"20px 24px"}}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--rose)",fontWeight:600,marginBottom:6}}>Badges Earned</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:14}}>Achievements ✨</div>
          <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#FDE8DF,#F5D0C0)",borderRadius:16,marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:32}}>🏅</span>
            <div><div style={{fontSize:14,fontWeight:600,color:"var(--deep)"}}>4 of 9 unlocked</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>Keep flowing to unlock more!</div></div>
          </div>
          <div className="achievements-grid">
            {ACHIEVEMENTS_DATA.map((a,i)=>(
              <div key={i} className={`achievement ${a.unlocked?"unlocked":"locked"}`}>
                {a.isNew&&<div style={{position:"absolute",top:6,right:6,background:"var(--rose)",color:"white",fontSize:8,fontWeight:700,letterSpacing:.5,padding:"2px 5px",borderRadius:4,textTransform:"uppercase"}}>New!</div>}
                <span style={{fontSize:28,marginBottom:6,display:"block"}}>{a.emoji}</span>
                <div style={{fontSize:11,fontWeight:600,color:"var(--deep)",marginBottom:2,lineHeight:1.3}}>{a.name}</div>
                <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.4}}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>}
        {tab==="profile"&&<div style={{padding:"20px 24px"}}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--rose)",fontWeight:600,marginBottom:6}}>Preferences</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:14}}>Settings</div>
          {SETTINGS.map((s,i)=>(
            <div className="settings-item" key={i}>
              <div style={{width:40,height:40,borderRadius:12,background:[" #FDE8DF","#FDECD4","#D4EDD4","#D9D4F0","#F0E8E4","#EDE3DD"][i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.emoji}</div>
              <div style={{flex:1}}><h4 style={{fontSize:14,fontWeight:500,color:"var(--deep)"}}>{s.label}</h4><p style={{fontSize:12,color:"var(--muted)",marginTop:1}}>{s.sub}</p></div>
              {s.toggle?<div className={`settings-toggle ${toggles[i]?"":"off"}`} onClick={()=>setToggles(t=>({...t,[i]:!t[i]}))}/>:<div style={{fontSize:16,color:"var(--muted)"}}>›</div>}
            </div>
          ))}
          <div style={{marginTop:20,textAlign:"center"}}><button style={{background:"none",border:"1.5px solid #EDE3DD",borderRadius:14,padding:"12px 28px",fontSize:13,color:"var(--muted)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Sign Out</button></div>
        </div>}
      </div>
      <BottomNav active={activeNav} navigate={navigate}/>
    </div>
  );
}

// ─────────────────────────────────────────────
// NUTRITION SCREEN
// ─────────────────────────────────────────────
const NUT_S = `
  .nut-header { padding:52px 24px 20px; background:linear-gradient(160deg,#EDF5F0 0%,#E0EDE8 50%,#D4E5DC 100%); position:relative; overflow:hidden; }
  .nut-blob { position:absolute; border-radius:50%; filter:blur(60px); opacity:.4; pointer-events:none; }
  .calorie-card { margin:20px 24px 0; padding:22px; background:white; border:1.5px solid #EDE3DD; border-radius:22px; display:flex; align-items:center; gap:22px; }
  .ring-wrap { position:relative; width:100px; height:100px; flex-shrink:0; }
  .ring-svg { transform:rotate(-90deg); }
  .ring-track { fill:none; stroke:#F0E8E4; stroke-width:8; }
  .ring-fill { fill:none; stroke-width:8; stroke-linecap:round; transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); }
  .ring-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .macro-track { flex:1; height:5px; background:#F0E8E4; border-radius:3px; overflow:hidden; }
  .macro-fill { height:100%; border-radius:3px; transition:width 1.2s cubic-bezier(.4,0,.2,1); }
  .water-card { margin:16px 24px; padding:20px; background:linear-gradient(135deg,#EAF5FA 0%,#D8EDF5 100%); border:1.5px solid #C4DFF0; border-radius:22px; }
  .glass-btn { width:44px; height:56px; border-radius:10px; border:2px solid rgba(106,170,196,.3); background:rgba(255,255,255,.5); cursor:pointer; position:relative; overflow:hidden; transition:all .2s; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:6px; }
  .glass-btn.filled { border-color:var(--water); background:rgba(106,170,196,.12); }
  .glass-fill { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top,rgba(106,170,196,.5),rgba(106,170,196,.2)); border-radius:0 0 8px 8px; animation:fillUp .4s ease; }
  .food-item { display:flex; align-items:center; gap:12px; padding:12px 14px; background:white; border:1.5px solid #EDE3DD; border-radius:14px; margin-bottom:8px; animation:slideDown .3s ease; transition:all .2s; }
  .food-item:hover { border-color:var(--blush); }
  .food-delete { font-size:16px; cursor:pointer; opacity:0; transition:opacity .2s; padding:4px; color:var(--muted); }
  .food-item:hover .food-delete { opacity:1; }
  .empty-meal { padding:18px; text-align:center; border:1.5px dashed #DDD0CA; border-radius:14px; font-size:13px; color:var(--muted); cursor:pointer; transition:all .2s; margin-bottom:8px; }
  .empty-meal:hover { border-color:var(--rose); color:var(--rose); }
  .modal-overlay { position:fixed; inset:0; background:rgba(61,43,43,.5); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:flex-end; animation:fadeIn .3s ease; }
  .modal-sheet { width:100%; max-width:420px; margin:0 auto; background:var(--warm-white); border-radius:28px 28px 0 0; padding:28px 24px 40px; animation:pop .4s cubic-bezier(.32,.72,0,1); max-height:80vh; overflow-y:auto; }
  .quick-item { display:flex; align-items:center; gap:10px; padding:12px; background:white; border:1.5px solid #EDE3DD; border-radius:14px; cursor:pointer; transition:all .2s; }
  .quick-item:hover { border-color:var(--rose); transform:translateY(-1px); }
`;
const INITIAL_MEALS={breakfast:[{id:1,emoji:"🥣",name:"Greek Yoghurt & Berries",detail:"200g · Protein 18g",cal:165},{id:2,emoji:"🍵",name:"Matcha Latte",detail:"Oat milk · No sugar",cal:95}],lunch:[{id:3,emoji:"🥗",name:"Buddha Bowl",detail:"Quinoa, roasted veg",cal:420},{id:4,emoji:"🫐",name:"Blueberry Smoothie",detail:"Banana, almond milk",cal:180}],dinner:[{id:5,emoji:"🍜",name:"Miso Soup with Tofu",detail:"Low sodium · Vegan",cal:210}],snacks:[{id:6,emoji:"🍎",name:"Apple & Almond Butter",detail:"1 tbsp almond butter",cal:160}]};
const QUICK_FOODS=[{emoji:"🍌",name:"Banana",detail:"Medium · 89 cal",cal:89},{emoji:"🥚",name:"Boiled Eggs",detail:"2 eggs · 140 cal",cal:140},{emoji:"🥑",name:"Avocado Toast",detail:"1 slice · 220 cal",cal:220},{emoji:"🫐",name:"Mixed Berries",detail:"100g · 57 cal",cal:57},{emoji:"🥜",name:"Mixed Nuts",detail:"30g · 180 cal",cal:180},{emoji:"🍵",name:"Green Tea",detail:"0 cal",cal:0},{emoji:"🍊",name:"Orange",detail:"Medium · 62 cal",cal:62},{emoji:"🧀",name:"Cottage Cheese",detail:"100g · 98 cal",cal:98}];
const MEAL_META=[{key:"breakfast",label:"Breakfast",emoji:"🌅",bg:"#FDE8DF"},{key:"lunch",label:"Lunch",emoji:"☀️",bg:"#FDECD4"},{key:"dinner",label:"Dinner",emoji:"🌙",bg:"#D9D4F0"},{key:"snacks",label:"Snacks",emoji:"🍎",bg:"#D4EDD4"}];
const MACROS={protein:{val:82,target:100,color:"#C4826A"},carbs:{val:168,target:220,color:"#6AAAC4"},fat:{val:48,target:65,color:"#8FA68E"}};
const TIPS=[{emoji:"💧",title:"Stay Hydrated",text:"Drinking water before meals boosts your metabolism and helps with portion control.",bg:"#EAF5FA",border:"#C4DFF0"},{emoji:"🌿",title:"Post-Yoga Nutrition",text:"After your morning flow, have a protein-rich snack within 30 minutes to aid recovery.",bg:"#EDF5ED",border:"#C4DCC4"},{emoji:"🌙",title:"Evening Eating",text:"Opt for lighter meals in the evening to improve sleep quality — a key wellness goal.",bg:"#F0EDF8",border:"#D4C8E8"}];
const GOAL_CAL=1800; const WATER_GOAL=8;
let nextFoodId=20;

function NutritionScreen({ navigate, activeNav }) {
  const [tab, setTab] = useState("diary");
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [water, setWater] = useState(3);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);
  const totalCal=Object.values(meals).flat().reduce((s,f)=>s+f.cal,0);
  const calPct=Math.min(totalCal/GOAL_CAL,1);
  const waterPct=Math.min(water/WATER_GOAL,1);
  const addFood=(mealKey,food)=>{ setMeals(m=>({...m,[mealKey]:[...m[mealKey],{id:nextFoodId++,emoji:food.emoji,name:food.name,detail:food.detail,cal:food.cal}]})); setModal(null); setSearch(""); };
  const removeFood=(mealKey,id)=>setMeals(m=>({...m,[mealKey]:m[mealKey].filter(f=>f.id!==id)}));
  const filtered=QUICK_FOODS.filter(f=>search===""||f.name.toLowerCase().includes(search.toLowerCase()));
  const ringR=44,ringCirc=2*Math.PI*ringR,ringOffset=ringCirc-(mounted?calPct*ringCirc:ringCirc);
  const WEEK_NUT=[{day:"M",pct:88,color:"#C4826A"},{day:"T",pct:72,color:"#8FA68E"},{day:"W",pct:95,color:"#C4826A"},{day:"T",pct:60,color:"#6AAAC4"},{day:"F",pct:83,color:"#C4A06A"},{day:"S",pct:91,color:"#C4826A"},{day:"S",pct:45,color:"#C8D8C7",today:true}];
  return(
    <div className="app" style={{paddingBottom:100}}>
      <style>{NUT_S}</style>
      <div className="nut-header">
        <div className="nut-blob" style={{width:220,height:220,background:"#C8D8C7",top:-60,right:-50}}/>
        <div className="nut-blob" style={{width:160,height:160,background:"#A8C4A8",bottom:-40,left:-30}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"var(--deep)"}}>Bloom<em style={{color:"var(--rose)",fontStyle:"italic"}}>.</em></div>
            <div style={{padding:"6px 14px",background:"rgba(255,255,255,.6)",borderRadius:50,fontSize:12,fontWeight:500,color:"var(--deep)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.8)"}}>📅 Wed, 8 Apr</div>
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,lineHeight:1.2,marginBottom:4}}>Nourish &<br/><em style={{fontStyle:"italic",color:"var(--sage)"}}>Hydrate</em> 🌿</h1>
          <div style={{fontSize:13,color:"var(--muted)"}}>Track your nutrition & water intake</div>
        </div>
      </div>
      {/* Calorie Ring */}
      <div className="calorie-card animate d1">
        <div className="ring-wrap">
          <svg className="ring-svg" width="100" height="100" viewBox="0 0 100 100">
            <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E8C4B8"/><stop offset="100%" stopColor="#C4826A"/></linearGradient></defs>
            <circle className="ring-track" cx="50" cy="50" r={ringR}/>
            <circle className="ring-fill" cx="50" cy="50" r={ringR} stroke="url(#cg)" strokeDasharray={ringCirc} strokeDashoffset={ringOffset}/>
          </svg>
          <div className="ring-center">
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"var(--rose)",lineHeight:1}}>{totalCal}</span>
            <span style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginTop:1}}>kcal</span>
          </div>
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            {[{v:GOAL_CAL,l:"Goal",c:"var(--deep)"},{v:GOAL_CAL-totalCal,l:"Left",c:"var(--sage)"},{v:82,l:"Burned",c:"var(--water)"}].map(s=>(
              <div key={s.l} style={{textAlign:"center"}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300,color:s.c,display:"block"}}>{s.v}</span><div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{s.l}</div></div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {Object.entries(MACROS).map(([k,m])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:10,color:"var(--muted)",width:46,textTransform:"capitalize"}}>{k}</div>
                <div className="macro-track"><div className="macro-fill" style={{width:mounted?`${(m.val/m.target)*100}%`:"0%",background:m.color}}/></div>
                <div style={{fontSize:10,color:"var(--muted)",width:30,textAlign:"right"}}>{m.val}g</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Water */}
      <div className="water-card animate d2">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300}}>Daily <em style={{fontStyle:"italic",color:"var(--water)"}}>Water</em> 💧</div>
          <div style={{fontSize:12,color:"var(--water)",fontWeight:500}}>{water} / {WATER_GOAL} glasses</div>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
          {Array.from({length:WATER_GOAL}).map((_,i)=>(
            <button key={i} className={`glass-btn ${i<water?"filled":""}`} onClick={()=>setWater(i<water?i:i+1)}>
              {i<water&&<div className="glass-fill" style={{height:"70%"}}/>}
              <span style={{fontSize:18,position:"relative",zIndex:1}}>{i<water?"💧":"🥛"}</span>
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,height:8,background:"rgba(255,255,255,.6)",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,var(--water),#4A90B4)",borderRadius:4,width:mounted?`${waterPct*100}%`:"0%",transition:"width .8s"}}/>
          </div>
          <div style={{fontSize:12,color:"var(--water)",fontWeight:600}}>{Math.round(waterPct*100)}%</div>
        </div>
      </div>
      {/* Tabs */}
      <div className="tab-bar">
        {["diary","insights"].map(t=><div key={t} className={`tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}
      </div>
      <div>
        {tab==="diary"&&<div style={{paddingTop:20}}>
          {MEAL_META.map((meta,mi)=>{
            const items=meals[meta.key];
            const sectionCal=items.reduce((s,f)=>s+f.cal,0);
            return(
              <div key={meta.key} style={{padding:"0 24px",marginBottom:20}} className="animate" style2={{animationDelay:`${mi*.07}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{meta.emoji}</span><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400}}>{meta.label}</h3></div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {sectionCal>0&&<span style={{fontSize:13,color:"var(--muted)"}}>{sectionCal} kcal</span>}
                    <button style={{width:28,height:28,background:"var(--deep)",border:"none",borderRadius:"50%",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}} onClick={()=>setModal(meta.key)}>+</button>
                  </div>
                </div>
                {items.map(food=>(
                  <div className="food-item" key={food.id}>
                    <span style={{fontSize:24}}>{food.emoji}</span>
                    <div style={{flex:1}}><h4 style={{fontSize:14,fontWeight:500,color:"var(--deep)"}}>{food.name}</h4><p style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{food.detail}</p></div>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"var(--deep)"}}>{food.cal}</div><div style={{fontSize:10,color:"var(--muted)"}}>kcal</div></div>
                    <span className="food-delete" onClick={()=>removeFood(meta.key,food.id)}>✕</span>
                  </div>
                ))}
                {items.length===0&&<div className="empty-meal" onClick={()=>setModal(meta.key)}>+ Add {meta.label.toLowerCase()}</div>}
              </div>
            );
          })}
        </div>}
        {tab==="insights"&&<div style={{paddingTop:20}}>
          <div style={{padding:"0 24px",marginBottom:14}} className="animate">
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--rose)",fontWeight:600,marginBottom:6}}>This Week</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:14}}>Calorie Trends</div>
            <div style={{padding:"18px 20px",background:"white",border:"1.5px solid #EDE3DD",borderRadius:18}}>
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:70}}>
                {WEEK_NUT.map((d,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                    <div style={{flex:1,width:"100%",background:"#F0E8E4",borderRadius:5,overflow:"hidden",position:"relative",minHeight:50}}>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,borderRadius:5,background:d.today?"#DDD0CA":d.color,height:mounted?`${d.pct}%`:"0%",transition:"height 1s"}}/>
                    </div>
                    <div style={{fontSize:10,color:d.today?"var(--rose)":"var(--muted)",fontWeight:500}}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{padding:"0 24px",marginBottom:14}} className="animate d2">
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:14}}>Macro Breakdown</div>
            <div style={{padding:"18px 20px",background:"white",border:"1.5px solid #EDE3DD",borderRadius:18}}>
              <div style={{display:"flex",gap:8}}>
                {Object.entries(MACROS).map(([k,m])=>{ const pct=Math.round((m.val/m.target)*100); return(
                  <div key={k} style={{flex:1,textAlign:"center",padding:"12px 8px",background:"var(--cream)",borderRadius:12}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:m.color}}>{m.val}g</div>
                    <div style={{fontSize:10,textTransform:"capitalize",color:"var(--muted)",margin:"2px 0"}}>{k}</div>
                    <div style={{height:4,background:"#EDE3DD",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:mounted?`${pct}%`:"0%",background:m.color,borderRadius:2,transition:"width 1.2s"}}/></div>
                    <div style={{fontSize:10,color:"var(--muted)",marginTop:3}}>{pct}%</div>
                  </div>
                );})}
              </div>
            </div>
          </div>
          {TIPS.map((tip,i)=>(
            <div key={i} style={{margin:"0 24px 14px",padding:"18px 20px",borderRadius:18,display:"flex",gap:14,alignItems:"flex-start",background:tip.bg,border:`1.5px solid ${tip.border}`}} className="animate">
              <span style={{fontSize:26,flexShrink:0,marginTop:2}}>{tip.emoji}</span>
              <div><h4 style={{fontSize:14,fontWeight:600,color:"var(--deep)",marginBottom:4}}>{tip.title}</h4><p style={{fontSize:13,lineHeight:1.6,color:"var(--muted)"}}>{tip.text}</p></div>
            </div>
          ))}
        </div>}
      </div>
      <BottomNav active={activeNav} navigate={navigate}/>
      {modal&&(
        <div className="modal-overlay" onClick={()=>{ setModal(null); setSearch(""); }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#DDD0CA",borderRadius:2,margin:"0 auto 22px"}}/>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,marginBottom:16}}>Add to {MEAL_META.find(m=>m.key===modal)?.label} {MEAL_META.find(m=>m.key===modal)?.emoji}</div>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"white",border:"1.5px solid #EDE3DD",borderRadius:14,marginBottom:16}}>
              <span>🔍</span>
              <input style={{flex:1,border:"none",outline:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,background:"transparent",color:"var(--deep)"}} placeholder="Search foods…" value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
              {search&&<span style={{cursor:"pointer",color:"var(--muted)",fontSize:16}} onClick={()=>setSearch("")}>✕</span>}
            </div>
            <h4 style={{fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:10}}>{search?"Results":"Quick Add"}</h4>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {filtered.map((f,i)=>(
                <div key={i} className="quick-item" onClick={()=>addFood(modal,f)}>
                  <span style={{fontSize:22}}>{f.emoji}</span>
                  <div><h5 style={{fontSize:13,fontWeight:500,color:"var(--deep)"}}>{f.name}</h5><p style={{fontSize:11,color:"var(--muted)"}}>{f.detail}</p></div>
                </div>
              ))}
              {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:20,color:"var(--muted)",fontSize:13}}>No foods found 🌿</div>}
            </div>
            <button style={{width:"100%",padding:15,background:"var(--cream)",border:"1.5px solid #EDE3DD",borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--muted)",cursor:"pointer"}} onClick={()=>{ setModal(null); setSearch(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function BloomApp() {
  const [screen, setScreen] = useState("quiz");
  const [activeNav, setActiveNav] = useState("Home");

  const navigate = (label) => {
    setActiveNav(label);
    const map = { "Home":"home", "Classes":"session-lobby", "Nutrition":"nutrition", "Profile":"profile" };
    setScreen(map[label] || "home");
  };

  if (screen === "quiz")         return <QuizScreen onComplete={() => setScreen("home")} />;
  if (screen === "session-lobby"||screen === "session") return <SessionPlayer onBack={() => { setScreen("home"); setActiveNav("Home"); }} />;
  if (screen === "profile")      return <ProgressScreen navigate={navigate} activeNav={activeNav} />;
  if (screen === "nutrition")    return <NutritionScreen navigate={navigate} activeNav={activeNav} />;

  // HOME (default)
  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <HomeScreen
        navigate={navigate}
        activeNav={activeNav}
        onStartSession={() => setScreen("session")}
      />
    </>
  );
}
