import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import {
  FluidHeroTitleCanvas,
  FluidPortraitCanvas,
  FluidProjectsStageCanvas,
} from "./FluidCursorEffect";
import "./SuryaScrollSections.css";

gsap.registerPlugin(ScrollTrigger);

function getInitials(title) {
  const cleaned = title.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
  const words = cleaned.split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export function SuryaHeroAbout({
  t,
  lang,
  clock,
  asset,
  goto,
  heroKey,
  Letters,
  VariableProximity,
  CircularText,
}) {
  const stageRef = useRef(null);
  const portraitRef = useRef(null);
  const vignetteRef = useRef(null);
  const he0Ref = useRef(null);
  const he1Ref = useRef(null);
  const [aboutActive, setAboutActive] = useState(false);
  const [useGL, setUseGL] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    setUseGL(!reduced && fine);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAboutActive(true);
      return;
    }

    const stage = stageRef.current;
    const portrait = portraitRef.current;
    const vignette = vignetteRef.current;
    const he0 = he0Ref.current;
    const he1 = he1Ref.current;
    if (!stage || !portrait || !he0 || !he1) return;

    const ctx = gsap.context(() => {
      // Calculate scale needed for the small portrait to cover the entire viewport
      const calcCoverScale = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pw = portrait.offsetWidth || 84;
        const ph = portrait.offsetHeight || 104;
        return Math.max(vw / pw, vh / ph) * 1.18;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setAboutActive(self.progress > 0.36);
          },
        },
      });

      // Phase 1 (0 -> 0.42): Hero-0 lifts & fades out while portrait scales to full-bleed
      tl.to(
        he0,
        {
          y: -110,
          opacity: 0,
          ease: "power2.inOut",
          duration: 0.38,
        },
        0
      );

      tl.to(
        portrait,
        {
          y: () => -(window.innerHeight * 0.42),
          scale: () => calcCoverScale(),
          ease: "power2.inOut",
          duration: 0.55,
        },
        0
      );

      if (vignette) {
        tl.to(
          vignette,
          {
            opacity: 1,
            ease: "power1.inOut",
            duration: 0.45,
          },
          0.12
        );
      }

      // Phase 2 (0.40 -> 0.72): About (he-1) reveals over the zoomed portrait and pins
      tl.fromTo(
        he1,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          ease: "power3.out",
          duration: 0.32,
        },
        0.4
      );

      // Hold pinned at the end while #projects slides up over it
      tl.to({}, { duration: 0.28 }, 0.72);
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="sa-hero-stage"
      ref={stageRef}
      aria-label="Hero and About"
    >
      {/* Anchor marker for #about smooth scroll target (~55% into the stage) */}
      <div
        id="about"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "56%",
          left: 0,
          width: "1px",
          height: "1px",
          pointerEvents: "none",
        }}
      />

      <div className="sa-hero-sticky">
        <div className="sa-grain" aria-hidden="true" />

        {/* Zooming Portrait with WebGL2 Liquid Mouse Ripple */}
        <div className="sa-portrait-wrap" ref={portraitRef} aria-hidden="true">
          <div className="sa-portrait-inner">
            <FluidPortraitCanvas
              className="sa-portrait-img"
              src={asset("images/profile.jpg?v=2")}
            />
          </div>
        </div>

        <div className="sa-portrait-vignette" ref={vignetteRef} aria-hidden="true" />

        {/* Stage 0: Initial Hero (surya-aditya.com exact layout & condensed typography) */}
        <div className="sa-he-0" ref={he0Ref}>
          <div className="sa-he-top">
            <h1 className={`sa-he-title ${useGL ? "has-gl" : ""}`} key={heroKey}>
              <span className="sr">Ifadah Aulia</span>
              {useGL && (
                <FluidHeroTitleCanvas leftText="IFADAH" rightText="AULIA" />
              )}
              <span className="sa-first" aria-hidden="true">
                <Letters text="IFADAH" start={0.22} />
              </span>
              <span className="sa-last" aria-hidden="true">
                <Letters text="AULIA" start={0.62} />
              </span>
            </h1>

            <div className="sa-he-meta">
              <div className="sa-meta-block">
                <span className="sa-meta-label">INFO:</span>
                <span className="sa-meta-info-text">
                  {lang === "id"
                    ? "IA MERANCANG PENGALAMAN DIGITAL DI BIDANG WEB DEVELOPMENT, ANALISIS DATA, DAN UI/UX — MENGUBAH DATA DAN IDE MENJADI PRODUK YANG BERMAKNA."
                    : "HE BUILDS DIGITAL EXPERIENCES ACROSS WEB DEVELOPMENT, DATA ANALYSIS, AND UI/UX — TURNING DATA AND IDEAS INTO MEANINGFUL PRODUCTS."}
                </span>
              </div>

              <div className="sa-meta-block">
                <span className="sa-meta-label">NAV.:</span>
                <nav className="sa-meta-nav" aria-label="Quick navigation">
                  <a href="#about" onClick={(e) => goto(e, "#about")}>
                    {t.menu.about}
                  </a>
                  <a href="#projects" onClick={(e) => goto(e, "#projects")}>
                    {t.menu.projects} (11)
                  </a>
                  <a href="#skills" onClick={(e) => goto(e, "#skills")}>
                    {t.menu.skills}
                  </a>
                  <a href="#certificates" onClick={(e) => goto(e, "#certificates")}>
                    {t.menu.certificates}
                  </a>
                  <a href="#contact" onClick={(e) => goto(e, "#contact")}>
                    {t.menu.contact}
                  </a>
                </nav>
              </div>

              <div className="sa-meta-right">
                <span className="sa-meta-label">{clock.time}</span>
                <span>©2026</span>
              </div>
            </div>
          </div>

          {/* Bottom center cluster flanking the small portrait */}
          <div className="sa-he-fo">
            <div className="sa-he-center-cluster">
              <span className="sa-monogram" aria-hidden="true">
                IA
              </span>

              <div className="sa-he-flank-row">
                <div className="sa-he-bio-left">
                  {lang === "id" ? (
                    <>
                      <div>IFADAH AULIA ADALAH</div>
                      <div>LULUSAN TI BRAWIJAYA,</div>
                    </>
                  ) : (
                    <>
                      <div>IFADAH AULIA IS AN</div>
                      <div>IT GRADUATE FROM BRAWIJAYA,</div>
                    </>
                  )}
                </div>

                <div className="sa-he-portrait-spacer" aria-hidden="true" />

                <div className="sa-he-bio-right">
                  {lang === "id" ? (
                    <>
                      <div>YANG BERKARYA DI BIDANG</div>
                      <div>WEB, DATA &amp; UI/UX DESIGN</div>
                    </>
                  ) : (
                    <>
                      <div>BUILDING EXPERIENCES ACROSS</div>
                      <div>WEB, DATA &amp; UI/UX DESIGN</div>
                    </>
                  )}
                </div>
              </div>

              <div className="sa-he-bio-bottom">
                {lang === "id"
                  ? "MERANCANG SOLUSI DIGITAL YANG HIDUP DAN BERDAMPAK SEJAK 2023."
                  : "TURNING TECHNOLOGY & DATA INTO EXPERIENCES THAT FEEL ALIVE (2023–2026)."}
              </div>
            </div>
          </div>
        </div>

        {/* Stage 1: Pinned About Overlay */}
        <div
          className={`sa-he-1 ${aboutActive ? "is-active" : ""}`}
          ref={he1Ref}
        >
          <div className="sa-ab-top">
            <div className="sa-ab-kicker">
              <span className="sa-monogram" style={{ color: "var(--orange)" }}>
                IA
              </span>
              <span>{t.aboutLabel}</span>
            </div>

            <p className="sa-ab-statement">
              {t.statement.map((line) => (
                <span key={line}>
                  <VariableProximity
                    className="vp-mona"
                    label={line}
                    fromFontVariationSettings="'wght' 500"
                    toFontVariationSettings="'wght' 850"
                    radius={170}
                    falloff="gaussian"
                    smoothing={0.25}
                    idleWave
                  />
                </span>
              ))}
            </p>
          </div>

          <div className="sa-ab-bottom">
            <div className="sa-ab-kicker" style={{ opacity: 0.75 }}>
            </div>

            <div className="sa-ab-paragraphs">
              {t.about.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>

            <div className="sa-ab-tags-col">
              <div className="sa-ab-tags">
                {t.tags.map((tag) => (
                  <span className="sa-ab-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="sa-ab-cta">
              <div style={{ display: "none" }} className="sa-ab-circular">
                <CircularText
                  text={`${t.tags.join(" • ").toUpperCase()} • `}
                  size={150}
                  fontSize={14}
                  fontWeight={900}
                  fill={false}
                  letterSpacing={0.04}
                  spinDuration={22}
                  color="var(--orange)"
                />
              </div>
              <a
                href="#projects"
                className="sa-ab-next"
                onClick={(e) => goto(e, "#projects")}
              >
                <span>{t.explore}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SuryaProjects({ t, projects, setProj, goto, asset }) {
  // Only trigger a project row when the cursor is actually over it
  const [activeIdx, setActiveIdx] = useState(null);
  const [useGL, setUseGL] = useState(false);
  const listWrapRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    setUseGL(!reduced && fine);
  }, []);

  const allProjects = projects.map((p, i) => ({ ...p, originalIndex: i }));

  const activeProject =
    activeIdx !== null
      ? allProjects.find((p) => p.originalIndex === activeIdx) ?? null
      : null;

  const allImageSrcs = projects.map((p) => asset(p.image));

  return (
    <section className="sa-work" id="projects" tabIndex={-1}>
      <div className="sa-wo-header">
        <h2 className="sa-wo-heading">
          <span>{t.projectsH1 ?? "FEATURED"} </span>
          <span className="or">{t.projectsH2 ?? "PROJECTS."}</span>
        </h2>

        <div className="sa-wo-controls">
          <span className="sa-wo-count">
            {t.workRight
              ? t.workRight(allProjects.length)
              : `${allProjects.length} PROJECTS`}
          </span>
        </div>
      </div>

      <div
        ref={listWrapRef}
        className={`sa-wo-list-wrap ${activeProject ? "has-active" : ""}`}
        onMouseLeave={() => setActiveIdx(null)}
      >
        {/* WebGL2 Center-Outward Preview Image (native HTML rows stay rock-solid & crisp) */}
        {useGL ? (
          <FluidProjectsStageCanvas
            listWrapRef={listWrapRef}
            allImageSrcs={allImageSrcs}
            activeImageSrc={activeProject ? asset(activeProject.image) : ""}
          />
        ) : (
          <div className="sa-wo-preview-layer" aria-hidden="true">
            <div
              className={`sa-wo-preview-card ${activeProject ? "is-visible" : ""}`}
            >
              {activeProject && (
                <img src={asset(activeProject.image)} alt="" />
              )}
            </div>
          </div>
        )}

        {allProjects.map((p, i) => {
          const num = String(i + 1).padStart(2, "0");
          const isActive = activeProject?.originalIndex === p.originalIndex;
          return (
            <button
              key={p.title}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              type="button"
              className={`sa-wo-row ${isActive ? "is-active" : ""}`}
              onMouseEnter={() => setActiveIdx(p.originalIndex)}
              onMouseMove={() => {
                if (activeIdx !== p.originalIndex) setActiveIdx(p.originalIndex);
              }}
              onFocus={() => setActiveIdx(p.originalIndex)}
              onClick={() => {
                setActiveIdx(null);
                setProj(p.originalIndex);
              }}
              aria-label={t.openAria ? t.openAria(p.title) : `Open ${p.title}`}
            >
              <div className="sa-wo-row-top">
                <span className="sa-wo-idx">P.{num}</span>
                <span className="sa-wo-mono">{getInitials(p.title)}</span>
                <span className="sa-wo-arrow" aria-hidden="true">
                  →
                </span>
              </div>

              <div className="sa-wo-row-meta">
                <span className="sa-wo-meta-val">PROJECT {num}</span>
                <span className="sa-wo-meta-val">
                  <span className="sa-wo-meta-label">NAME:</span>
                  {p.title}
                </span>
                <span className="sa-wo-meta-val">
                  <span className="sa-wo-meta-label">TYPE:</span>
                  {p.kind}
                </span>
                <span className="sa-wo-meta-val" style={{ textAlign: "right" }}>
                  <span className="sa-wo-meta-label">STACK:</span>
                  {p.tech.slice(0, 3).join(" · ")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sa-wo-footer-bar">
        <span>{t.haveProject}</span>
        <a
          className="pill"
          href="#contact"
          onClick={(e) => goto(e, "#contact")}
        >
          {t.startConv}
        </a>
      </div>
    </section>
  );
}

export function SuryaProjectDetail({
  proj,
  projects,
  setProj,
  t,
  asset,
}) {
  const P = proj !== null ? projects[proj] : null;
  const overlayRef = useRef(null);
  const topbarRef = useRef(null);

  useEffect(() => {
    if (proj === null) return;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = 0;
    }
    const updateTopVar = () => {
      if (overlayRef.current && topbarRef.current) {
        overlayRef.current.style.setProperty(
          "--sa-pd-top",
          `${topbarRef.current.offsetHeight}px`
        );
      }
    };
    updateTopVar();
    window.addEventListener("resize", updateTopVar);

    const onKey = (e) => {
      if (e.key === "Escape") setProj(null);
      if (e.key === "ArrowRight") setProj((proj + 1) % projects.length);
      if (e.key === "ArrowLeft")
        setProj((proj - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", updateTopVar);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [proj, projects.length, setProj]);

  const num = proj !== null ? String(proj + 1).padStart(2, "0") : "00";
  const prevIdx = proj !== null ? (proj - 1 + projects.length) % projects.length : 0;
  const nextIdx = proj !== null ? (proj + 1) % projects.length : 0;

  const domainLabel = P?.url
    ? P.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0].toUpperCase()
    : null;

  return (
    <AnimatePresence>
      {P && (
        <motion.div
          ref={overlayRef}
          className="sa-pd-overlay"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-labelledby="sa-pd-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.48, ease: [0.19, 1, 0.22, 1] }}
        >
          <motion.div
            ref={topbarRef}
            className="sa-pd-topbar"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="sa-pd-row-top">
              <span className="sa-pd-idx">P.{num}</span>
              <span className="sa-pd-mono">{getInitials(P.title)}</span>
              {P.url ? (
                <a
                  href={P.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sa-pd-close"
                  style={{ borderColor: "rgba(255,99,15,0.5)", color: "var(--orange)" }}
                >
                  <span>{domainLabel || t.openProject}</span>
                  <span>↗</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="sa-pd-close"
                  onClick={() => setProj(null)}
                  aria-label={t.closeCase}
                >
                  <span>{t.closeLabel ?? "CLOSE"}</span>
                  <span>✕</span>
                </button>
              )}
            </div>

            <div className="sa-pd-row-meta">
              <span>PROJECT {num}</span>
              <span>NAME: {P.title}</span>
              <span>TYPE: {P.kind}</span>
              <span style={{ textAlign: "right" }}>
                STACK: {P.tech.slice(0, 3).join(" · ")}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="sa-pd-body"
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="sa-pd-split">
              {/* Left Column: Scrollable Visual Showcase */}
              <div className="sa-pd-left">
                <div className="sa-pd-media">
                  <img src={asset(P.image)} alt={`${P.title} showcase`} />
                </div>

                <div className="sa-pd-card">
                  <div className="sa-pd-spec-label">
                    {t.caseStudy} / {num}
                  </div>
                  <h2 className="sa-pd-card-title" id="sa-pd-title">
                    {P.title}
                  </h2>
                  <p className="sa-pd-desc" style={{ textTransform: "none", fontSize: 15 }}>
                    {P.text}
                  </p>
                </div>

                <div className="sa-pd-card">
                  <div className="sa-pd-spec-label">{t.techStack}</div>
                  <div className="sa-pd-tags">
                    {P.tech.map((item) => (
                      <span className="sa-pd-tag" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="sa-pd-spec-label" style={{ marginTop: 12 }}>
                    {t.highlights}
                  </div>
                  <div className="sa-pd-tags">
                    {P.tags.map((item) => (
                      <span className="sa-pd-tag" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Back Button & Info Footer (matches surya-aditya.com) */}
              <div className="sa-pd-right">
                <div className="sa-pd-back-wrap">
                  <button
                    type="button"
                    className="sa-pd-back-btn"
                    onClick={() => setProj(null)}
                  >
                    <span>←</span>
                    <span>BACK TO PROJECTS</span>
                  </button>
                </div>

                <div>
                  <div className="sa-pd-right-bottom">
                    <div>
                      <div className="sa-pd-spec-label">INFO:</div>
                      <p className="sa-pd-desc">{P.text}</p>
                    </div>

                    <div>
                      <div className="sa-pd-spec-label">{t.focus}:</div>
                      <div className="sa-pd-spec-val" style={{ marginBottom: 12 }}>
                        {P.cat}
                      </div>
                      {P.url && (
                        <a
                          className="sa-pd-launch"
                          href={P.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>{t.openProject}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="sa-pd-nav-footer">
                    <button
                      type="button"
                      className="sa-pd-nav-btn"
                      onClick={() => setProj(prevIdx)}
                    >
                      ← P.{String(prevIdx + 1).padStart(2, "0")} {projects[prevIdx].title}
                    </button>
                    <button
                      type="button"
                      className="sa-pd-nav-btn"
                      onClick={() => setProj(nextIdx)}
                    >
                      P.{String(nextIdx + 1).padStart(2, "0")} {projects[nextIdx].title} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
