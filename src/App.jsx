import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import proposalCatsAsset from "./assets/proposal-cats.png.asset.png";
import royalProposalAsset from "./assets/royal-proposal.jpeg.asset.jpeg";
import memorySunsetAsset from "./assets/memory-sunset.jpg.asset.jpeg";
import memoryGraceHatAsset from "./assets/memory-grace-hat.jpg.asset.jpeg";
import memoryGraceNycAsset from "./assets/memory-grace-nyc.jpg.asset.jpeg";
import memoryRobinAsset from "./assets/memory-robin.jpg.asset.jpeg";
import proposalCoupleAsset from "./assets/proposal-couple.jpg.asset.jpeg";
import paintingRedHoodAsset from "./assets/painting-red-hood.jpeg.asset.jpeg";
import paintingRoseAsset from "./assets/painting-rose.jpeg.asset.jpeg";
import paintingSunflowersAsset from "./assets/painting-sunflowers.jpeg.asset.jpeg";
import "./App.css";

const STORY =
  "Somewhere between the ordinary Tuesdays and the nights we talked until the sky turned gold, you became the place I feel most like myself. You are the calm in my chaos and the laughter in my quiet, the reason I started noticing small, beautiful things again. I have loved you in the loud, easy moments, and I have loved you even more in the soft, unremarkable ones, the ones no one else will ever know about but us. You didn't just change my days. You changed what I believe a life with someone can feel like.";

const HIDDEN_NOTES = [
  "I love the way you say my name when you're half asleep.",
  "You always order the same thing and pretend you're going to try something new.",
  "Your laugh is my favorite sound, full stop.",
];

const NO_LABELS = [
  "No",
  "Are you sure? 🥺",
  "Really? 🥺🥺",
  "Please? 🥺🥺🥺",
  "I'll be sad... 😢",
  "Last chance! 🥹",
  "You know you want to 💗",
];

const MEMORIES = [
  {
    when: "The day the sky put on a show",
    title: "Chasing sunsets with you",
    caption:
      "The whole sky turned gold just for us — and I realised no view would ever beat the one beside me.",
    img: memorySunsetAsset,
    alt: "Robin at sunset above a lake, the sky glowing gold",
  },
  {
    when: "That smile I fell for",
    title: "You, in your sunshine hat",
    caption:
      "One look at you and my whole day got brighter. You wear colour the way the sun wears morning.",
    img: memoryGraceHatAsset,
    alt: "Grace smiling in a bright yellow hat",
  },
  {
    when: "Autumn in the city",
    title: "Golden hour, golden you",
    caption:
      "New York streets, falling leaves, and you — my favourite season has your face in every memory.",
    img: memoryGraceNycAsset,
    alt: "Grace on a New York street in autumn light",
  },
  {
    when: "Every ordinary day",
    title: "Me, thinking of you",
    caption:
      "Even in the most ordinary moments, my mind drifts back to you. It always has. It always will.",
    img: memoryRobinAsset,
    alt: "Robin in sunglasses, thinking of Grace",
  },
];

const PAINTINGS = [
  {
    label: "Painting I",
    img: paintingRedHoodAsset,
    alt: "A painting of a woman in a red hood standing in an enchanted forest",
    caption: "For the beautiful worlds you inspire me to imagine.",
  },
  {
    label: "Painting II",
    img: paintingRoseAsset,
    alt: "A painting of a single red rose against a rich red and black background",
    caption: "A rose for the love that keeps blooming between us.",
  },
  {
    label: "Painting III",
    img: paintingSunflowersAsset,
    alt: "A painting of sunflowers beneath a swirling golden sunset sky",
    caption: "For every ordinary day you turn golden.",
  },
];

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/* ---------------- Full-page ambience (never resets between scenes) ---------------- */
function useAmbientChord() {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const [on, setOn] = useState(false);

  const start = useCallback(() => {
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      void ctxRef.current.resume();
      setOn(true);
      return;
    }
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.075, ctx.currentTime + 2.2);
    master.connect(ctx.destination);
    [174.61, 220, 261.63, 329.63].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.28 / (i + 1);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(master);
      osc.start();
      lfo.start();
    });
    gainRef.current = master;
    setOn(true);
  }, []);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const master = gainRef.current;
    if (ctx && master && ctx.state !== "closed") {
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      setTimeout(() => {
        void ctx.close();
      }, 1000);
    }
    ctxRef.current = null;
    gainRef.current = null;
    setOn(false);
  }, []);

  const toggle = useCallback(() => {
    if (on) stop();
    else start();
  }, [on, start, stop]);

  useEffect(() => {
    const startOnce = () => {
      start();
    };
    window.addEventListener("pointerdown", startOnce, { once: true });
    window.addEventListener("keydown", startOnce, { once: true });
    return () => {
      window.removeEventListener("pointerdown", startOnce);
      window.removeEventListener("keydown", startOnce);
    };
  }, [start]);

  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        void ctxRef.current.close();
      }
      ctxRef.current = null;
      gainRef.current = null;
    };
  }, []);

  return { on, toggle };
}

/* ---------------- Full-page ambience (never resets between scenes) ---------------- */
function AmbientBackground() {
  const items = useMemo(
    () =>
      Array.from({ length: 38 }, (_, i) => ({
        id: i,
        left: Math.random() * 96 + 2,
        dur: 10 + Math.random() * 14,
        delay: -Math.random() * 20,
        glyph: ["🌸", "🌹", "💗", "🤍", "🌺"][i % 5],
        size: 0.55 + Math.random() * 0.85,
      })),
    [],
  );
  const bokeh = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 96 + 2,
        top: Math.random() * 90,
        size: 28 + Math.random() * 90,
        dur: 8 + Math.random() * 10,
        delay: -Math.random() * 10,
      })),
    [],
  );

  return (
    <div className="pr-ambient" aria-hidden="true">
      {bokeh.map((b) => (
        <span
          key={`b${b.id}`}
          className="pr-bokeh"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
      {items.map((p) => (
        <span
          key={`p${p.id}`}
          className="pr-petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}

/* ---------------- Scenes ---------------- */
function SceneLanding({ next }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), 4400);
    const nextTimer = window.setTimeout(next, 5000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(nextTimer);
    };
  }, [next]);

  return (
    <section className={`pr-scene pr-intro${leaving ? " is-leaving" : ""}`}>
      <div className="pr-intro-content">
        <img
          className="pr-intro-image"
          src={proposalCatsAsset}
          alt="Two affectionate cats with pink hearts"
        />
        <h1 className="pr-intro-message">
          I have something special for you
          <span>Grace</span>
        </h1>
        <span className="pr-loading-dots" aria-label="Opening your message">
          <i />
          <i />
          <i />
        </span>
      </div>
    </section>
  );
}

function SceneLetter({ next }) {
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState(false);
  const [note, setNote] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setStart(true), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!start) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTyped(STORY);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(STORY.slice(0, i));
      if (i >= STORY.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [start]);

  const done = typed.length >= STORY.length;
  const notePositions = [
    { top: "12%", left: "8%" },
    { top: "26%", right: "10%" },
    { bottom: "16%", left: "14%" },
  ];

  return (
    <section className="pr-scene pr-scene-letter">
      <div className="pr-notes">
        {HIDDEN_NOTES.map((n, i) => (
          <button
            key={n}
            className="pr-note-btn"
            style={{ ...notePositions[i], animationDelay: `${i * 0.6}s` }}
            aria-label={`Open hidden note ${i + 1}`}
            onClick={() => setNote(note === n ? null : n)}
          >
            💌
          </button>
        ))}
      </div>

      <h2 className="pr-display pr-dear">Dear Grace,</h2>

      <div className="pr-letter-card">
        {start && (
          <p className="pr-story">
            <span className="pr-cap">{typed.charAt(0)}</span>
            {typed.slice(1)}
            {!done && <span className="pr-caret" />}
          </p>
        )}
      </div>

      {done && (
        <button className="pr-btn pr-fade" onClick={next}>
          Keep going 💫
        </button>
      )}

      {note && (
        <div className="pr-note-card" role="status">
          {note}
        </div>
      )}
    </section>
  );
}

function Boom() {
  return (
    <>
      <div className="pr-flash" aria-hidden="true" />
      <div className="pr-shock" aria-hidden="true" />
      <div className="pr-shock" style={{ animationDelay: "0.18s" }} aria-hidden="true" />
    </>
  );
}

function ScenePaintings({ next }) {
  const [opened, setOpened] = useState([]);

  const togglePainting = (index) => {
    setOpened((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };

  return (
    <section className="pr-scene pr-scene-paintings">
      <div className="pr-paintings-intro">
        <span className="pr-palette" aria-hidden="true">🎨</span>
        <h2>
          Before I say what I came here to say... I want to show you something I made for you.
        </h2>
      </div>

      <div className="pr-painting-grid">
        {PAINTINGS.map((painting, index) => {
          const isOpen = opened.includes(index);
          return (
            <button
              key={painting.label}
              type="button"
              className={`pr-painting-box${isOpen ? " is-open" : ""}`}
              onClick={() => togglePainting(index)}
              aria-expanded={isOpen}
              aria-label={`${isOpen ? "Close" : "Reveal"} ${painting.label}`}
            >
              <span className="pr-painting-cover" aria-hidden={isOpen}>
                <span className="pr-frame-mark">⌑</span>
                <strong>{painting.label}</strong>
                <span>Painted for you</span>
              </span>
              <span className="pr-painting-reveal" aria-hidden={!isOpen}>
                <span className="pr-ornate-frame">
                  <img src={painting.img} alt={isOpen ? painting.alt : ""} />
                </span>
                <span className="pr-painting-caption">{painting.caption}</span>
              </span>
            </button>
          );
        })}
      </div>

      {opened.length > 0 && (
        <button className="pr-btn pr-fade" onClick={next}>
          Keep going 💫
        </button>
      )}
    </section>
  );
}

function SceneQuestion({ onYes }) {
  const [step, setStep] = useState(0);
  const [noIdx, setNoIdx] = useState(0);
  const [noPos, setNoPos] = useState({ left: 55, top: 0 });

  useEffect(() => {
    const timers = [1200, 2600, 4200, 6400].map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const hearts = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: 7 + Math.random() * 9,
        delay: -Math.random() * 10,
        size: 0.8 + Math.random() * 1.1,
      })),
    [],
  );

  const dodge = () => {
    setNoIdx((n) => Math.min(n + 1, NO_LABELS.length - 1));
    setNoPos({ left: 8 + Math.random() * 76, top: Math.random() * 62 });
  };

  return (
    <section className="pr-scene pr-scene-question">
      {step >= 2 &&
        hearts.map((h) => (
          <span
            key={h.id}
            className="pr-heart-bg"
            aria-hidden="true"
            style={{
              left: `${h.left}%`,
              fontSize: `${h.size}rem`,
              animationDuration: `${h.dur}s`,
              animationDelay: `${h.delay}s`,
            }}
          >
            💗
          </span>
        ))}

      {step >= 1 && <p className="pr-small pr-fade">I've been planning this moment for a long time...</p>}

      {step >= 2 && (
        <>
          <img
            className="pr-question-photo pr-fade"
            src={proposalCoupleAsset}
            alt="Robin and Grace together"
          />
          <p className="pr-display pr-love-line" aria-label="I love you.">
            {"I love you.".split("").map((c, i) => (
              <span
                key={i}
                className="pr-letter"
                aria-hidden="true"
                style={{ animationDelay: `${i * 0.09}s` }}
              >
                {c === " " ? "\u00A0" : c}
              </span>
            ))}
          </p>
        </>
      )}

      {step >= 4 && (
        <>
          <Boom />
          <h2 className="pr-display pr-question">Will you marry me?</h2>
          <div className="pr-answers">
            <button className="pr-btn pr-yes pr-fade" onClick={onYes}>
              Yes 💍
            </button>
            <button
              className="pr-btn pr-btn-ghost pr-no"
              style={{
                left: `${noPos.left}%`,
                top: `${noPos.top}%`,
                transform: `scale(${1 - noIdx * 0.07})`,
              }}
              onMouseEnter={dodge}
              onFocus={dodge}
              onClick={dodge}
            >
              {NO_LABELS[noIdx]}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function SceneCelebration({ next }) {
  const [open, setOpen] = useState(false);
  const [ringUp, setRingUp] = useState(false);
  const [text, setText] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setOpen(true), 900),
      setTimeout(() => setRingUp(true), 2200),
      setTimeout(() => setText(1), 3800),
      setTimeout(() => setText(2), 5200),
      setTimeout(() => setText(3), 6600),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        const d = 180 + Math.random() * 320;
        return {
          id: i,
          dx: `${Math.cos(a) * d}px`,
          dy: `${Math.sin(a) * d}px`,
          color: ["#F5C77E", "#FF6F91", "#FFF3E6", "#FFB4C6"][i % 4],
          delay: Math.random() * 0.2,
        };
      }),
    [],
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: 3.5 + Math.random() * 4,
        delay: Math.random() * 2.5,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 12,
        round: i % 3 === 0,
        color: ["#F5C77E", "#FF6F91", "#FFF3E6", "#C9962E", "#FFB4C6"][i % 5],
      })),
    [],
  );

  return (
    <section className="pr-scene">
      <div className="pr-flash" aria-hidden="true" />
      {particles.map((p) => (
        <span
          key={p.id}
          className="pr-particle"
          aria-hidden="true"
          style={
            {
              background: p.color,
              animationDelay: `${p.delay}s`,
              "--dx": p.dx,
              "--dy": p.dy,
            }
          }
        />
      ))}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="pr-confetti"
          aria-hidden="true"
          style={{
            left: `${c.left}%`,
            width: c.w,
            height: c.h,
            background: c.color,
            borderRadius: c.round ? "50%" : "2px",
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <div className="pr-ring-stage">
        <div className={`pr-rays${open ? " on" : ""}`} aria-hidden="true" />
        <div className="pr-box" aria-hidden="true" />
        <div className={`pr-lid${open ? " open" : ""}`} aria-hidden="true" />
        <div className={`pr-ring${ringUp ? " up" : ""}`} role="img" aria-label="A gold ring with a photo of Robin and Grace inside it">
          <img
            className="pr-ring-photo"
            src={royalProposalAsset}
            alt="A prince holding a rose while looking toward a princess"
          />
          <div className="pr-band" />
          <div className="pr-gem">
            <span className="pr-facet pr-f1" />
            <span className="pr-facet pr-f2" />
            <span className="pr-facet pr-f3" />
            <span className="pr-facet pr-f4" />
            <span className="pr-facet pr-f5" />
            <span className="pr-glint" />
          </div>
          <span className="pr-sparkle" style={{ top: "-2.6rem", left: "-1.4rem" }} />
          <span
            className="pr-sparkle"
            style={{ top: "-0.6rem", right: "-1.6rem", animationDelay: "0.7s" }}
          />
          <span
            className="pr-sparkle"
            style={{ bottom: "-0.8rem", left: "1.2rem", animationDelay: "1.3s" }}
          />
        </div>
      </div>

      {text >= 1 && (
        <h2 className="pr-display pr-fade" style={{ fontSize: "clamp(1.8rem, 6vw, 3.4rem)", color: "var(--gold)" }}>
          I am the luckiest person in the world.
        </h2>
      )}
      {text >= 2 && (
        <p className="pr-story pr-fade" style={{ textAlign: "center" }}>
          Thank you for saying yes, Grace — for choosing me, today and for all the days after this
          one. Every memory we've made was just the beginning.
        </p>
      )}
      {text >= 3 && (
        <>
          <p className="pr-small pr-fade">This is just the start of our story...</p>
          <button className="pr-btn pr-fade" onClick={next}>
            See our memories 📸
          </button>
        </>
      )}
    </section>
  );
}

function SceneMemories() {
  const ref = useRef(null);

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".pr-entry");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        }),
      { threshold: 0.25 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="pr-scene">
      <h2 className="pr-display" style={{ fontSize: "clamp(1.9rem, 6vw, 3.2rem)", color: "var(--gold)" }}>
        Our memories
      </h2>
      <div className="pr-timeline" ref={ref}>
        {MEMORIES.map((m) => (
          <article className="pr-entry" key={m.title}>
            <img className="pr-photo" src={m.img} alt={m.alt} style={{ objectFit: "cover" }} />
            <div>
              <span className="pr-small">{m.when}</span>
              <h3>{m.title}</h3>
              <p>{m.caption}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="pr-small" style={{ marginTop: "2rem" }}>
        Grace &amp; Robin — and every day after this one 💍
      </p>
    </section>
  );
}

/* ---------------- Root ---------------- */
function App() {
  const [scene, setScene] = useState(1);
  const mounted = useMounted();
  const music = useAmbientChord();

  return (
    <main className="pr-root" data-scene={scene}>
      {mounted && <AmbientBackground />}

      <button
        className="pr-music"
        onClick={music.toggle}
        aria-pressed={music.on}
        aria-label={music.on ? "Turn ambient music off" : "Turn ambient music on"}
      >
        {music.on ? "♪" : "♪̸"}
      </button>

      {scene === 1 && <SceneLanding next={() => setScene(2)} />}
      {scene === 2 && <SceneLetter next={() => setScene(3)} />}
      {scene === 3 && <ScenePaintings next={() => setScene(4)} />}
      {scene === 4 && <SceneQuestion onYes={() => setScene(5)} />}
      {scene === 5 && <SceneCelebration next={() => setScene(6)} />}
      {scene === 6 && <SceneMemories />}
    </main>
  );
}

export default App;
