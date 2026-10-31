import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import "./ProjectDropdown.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ProjectDropdown({
  group,
  isOpen,
  onToggle,
  onSelectProject,
  openLabel = "View",
  closeLabel = "Close",
  colProject = "Project",
  colDiscipline = "Discipline",
  openAria = (t) => `Open ${t} case study`,
  asset = (p) => p,
  countText,
}) {
  const bodyRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const accentLineRef = useRef(null);
  const [textLines, setTextLines] = useState([isOpen ? closeLabel : openLabel]);
  const isFirstRender = useRef(true);

  // Animate text rolling like StaggeredMenu
  const animateText = useCallback((opening) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    const currentLabel = opening ? openLabel : closeLabel;
    const targetLabel = opening ? closeLabel : openLabel;
    const seq = [currentLabel];
    let last = currentLabel;

    for (let i = 0; i < 3; i++) {
      last = last === openLabel ? closeLabel : openLabel;
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    gsap.to(inner, {
      yPercent: -finalShift,
      duration: prefersReducedMotion() ? 0.01 : 0.45 + lineCount * 0.04,
      ease: "power4.out",
    });
  }, [openLabel, closeLabel]);

  // Main open/close animation
  useEffect(() => {
    const body = bodyRef.current;
    const icon = iconRef.current;
    const accent = accentLineRef.current;
    const reduce = prefersReducedMotion();

    if (!body || !icon) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (isOpen) {
        gsap.set(body, { height: "auto", opacity: 1, display: "block" });
        gsap.set(icon, { rotate: 225 });
        if (accent) gsap.set(accent, { scaleX: 1 });
      } else {
        gsap.set(body, { height: 0, opacity: 0, display: "none" });
        gsap.set(icon, { rotate: 0 });
        if (accent) gsap.set(accent, { scaleX: 0 });
      }
      return;
    }

    animateText(isOpen);

    if (isOpen) {
      // Opening
      gsap.killTweensOf([body, icon, accent]);
      gsap.set(body, { display: "block" });

      // Plus spins 225deg into cross × (exact StaggeredMenu easing)
      gsap.to(icon, {
        rotate: 225,
        duration: reduce ? 0.01 : 0.75,
        ease: "power4.out",
      });

      // Accent top line scales in
      if (accent) {
        gsap.fromTo(
          accent,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: reduce ? 0.01 : 0.6,
            ease: "power4.out",
            transformOrigin: "left center",
          }
        );
      }

      // Height expansion
      gsap.fromTo(
        body,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: reduce ? 0.01 : 0.65,
          ease: "power4.out",
        }
      );

      // Staggered slide up of the project rows
      const rows = body.querySelectorAll(".row.grid");
      if (rows.length) {
        gsap.fromTo(
          rows,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: reduce ? 0.01 : 0.75,
            ease: "power4.out",
            stagger: { each: 0.06, from: "start" },
            delay: reduce ? 0 : 0.08,
          }
        );
      }
    } else {
      // Closing
      gsap.killTweensOf([body, icon, accent]);

      // Icon spins back to 0 (plus +)
      gsap.to(icon, {
        rotate: 0,
        duration: reduce ? 0.01 : 0.45,
        ease: "power3.inOut",
      });

      // Accent line collapses
      if (accent) {
        gsap.to(accent, {
          scaleX: 0,
          duration: reduce ? 0.01 : 0.35,
          ease: "power3.inOut",
          transformOrigin: "right center",
        });
      }

      // Height collapses
      gsap.to(body, {
        height: 0,
        opacity: 0,
        duration: reduce ? 0.01 : 0.45,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(body, { display: "none" });
        },
      });
    }
  }, [isOpen, animateText]);

  return (
    <div className={`pdrop-card${isOpen ? " is-open" : ""}`}>
      {/* Accent prelayer top line */}
      <div className="pdrop-accent-line" ref={accentLineRef} aria-hidden="true" />

      {/* Header bar / Dropdown trigger */}
      <button
        type="button"
        className="pdrop-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="pdrop-title-wrap">
          <h3 className="pdrop-title">{group.title}</h3>
          {group.desc && <p className="pdrop-desc">{group.desc}</p>}
        </div>

        <div className="pdrop-actions">
          {countText && <span className="pdrop-count">{countText}</span>}

          {/* Toggle pill matching .sm-toggle */}
          <div className="pdrop-toggle-btn" aria-hidden="true">
            <span className="pdrop-text-wrap">
              <span className="pdrop-text-inner" ref={textInnerRef}>
                {textLines.map((line, idx) => (
                  <span className="pdrop-text-line" key={idx}>
                    {line}
                  </span>
                ))}
              </span>
            </span>

            {/* Menu plus icon */}
            <span className="pdrop-icon" ref={iconRef}>
              <span className="pdrop-icon-line pdrop-icon-h" />
              <span className="pdrop-icon-line pdrop-icon-v" />
            </span>
          </div>
        </div>
      </button>

      {/* Expandable Body */}
      <div className="pdrop-body" ref={bodyRef}>
        <div className="pdrop-inner">
          <div className="grid th">
            <span>#</span>
            <span>{colProject}</span>
            <span>{colDiscipline}</span>
            <span />
          </div>

          {group.items.map((p, itemIdx) => (
            <button
              key={p.title}
              className="row grid"
              onClick={() => onSelectProject(p.originalIndex)}
              aria-label={openAria(p.title)}
            >
              <span className="i">{String(itemIdx + 1).padStart(2, "0")}</span>
              <span className="t">{p.title}</span>
              <span className="d">{p.kind}</span>
              <span className="a" aria-hidden="true">
                →
              </span>
              <img className="pv" src={asset(p.image)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

