import React, { useEffect, useRef, useState } from "react";
import StaggeredMenu from "./StaggeredMenu.jsx";
import "@fontsource-variable/mona-sans/wdth.css";
import { COPY, PROJECTS_ID, SERVICES_ID } from "./i18n.js";
import AnimatedCat from "./components/ui/AnimatedCat";
import TechText from "./components/ui/TechText";
import VariableProximity from './components/ui/VariableProximity';
import CircularText from './components/ui/CircularText';
import FlexCarousel from "./components/ui/FlexCarousel";
import { TECH_LOGOS, TechLogo } from "./components/ui/TechLogos";
import Dither from "./components/ui/Dither";
import ProjectDropdown from "./components/ui/ProjectDropdown";

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;

const PERSON = {
  email: "ifadahauliasinaga@gmail.com",
  socials: [
    [
      "LinkedIn",
      "https://www.linkedin.com/in/ifadah-aulia-muhti-sinaga-15a366289/",
    ],
    ["GitHub", "https://github.com/Padskieee"],
    ["Instagram", "https://www.instagram.com/ifadahaulia_/"],
  ],
};

const PROJECTS = [
  {
    title: "HR-Insight",
    category: "data",
    kind: "Analytics Dashboard",
    cat: "HR Analytics & Information System",
    image: "images/hr-insight.png",
    url: "https://hrinsight.infinityfree.io/",
    tech: ["Laravel", "PHP", "MySQL", "Chart.js", "Tailwind CSS"],
    tags: [
      "HR Analytics",
      "Data Visualization",
      "Database Management",
      "Dashboard",
    ],
    text:
      "A web-based HR analytics and information system for managing " +
      "employee, department, and position data, with workforce insights" +
      " through interactive dashboards, data visualization, and " +
      "reporting.",
  },
  {
    title: "FinTrack",
    category: "data",
    kind: "Financial Dashboard",
    cat: "Financial Tracking & Analytics",
    image: "images/fintrack.png",
    url: "https://fintrack-9a93qt4f.manus.space/",
    tech: ["React", "JavaScript", "Vite", "Tailwind CSS"],
    tags: [
      "Financial Dashboard",
      "Data Visualization",
      "Transaction Management",
      "Analytics",
    ],
    text:
      "A financial tracking app for monitoring income, expenses, and " +
      "financial activity through organized transaction management, " +
      "summaries, and interactive charts.",
  },
  {
    title: "ProfitRiddle",
    category: "data",
    kind: "Business Analytics Tool",
    cat: "Business Analytics",
    image: "images/profit-riddle.png",
    url: "",
    tech: ["React", "TypeScript", "Vite", "Tailwind CSS", "Node.js"],
    tags: [
      "Business Analytics",
      "Financial Analysis",
      "Scenario Analysis",
      "Data Visualization",
      "AI Assistant",
    ],
    text:
      "A business analytics app for Indonesian small businesses to " +
      "analyze costs, profit margins, break-even points, and sales " +
      "targets through interactive pricing scenarios.",
  },
  {
    title: "Arus",
    category: "data",
    kind: "Monitoring Dashboard",
    cat: "Smart City & Traffic Monitoring",
    image: "images/arus.png",
    url: "https://medan-traffi-akzztqby.manus.space/",
    tech: ["React", "TypeScript", "Vite"],
    tags: ["Dashboard", "Traffic Monitoring", "Smart City"],
    text:
      "A traffic monitoring platform that visualizes road activity and " +
      "congestion in Medan through an interactive dashboard.",
  },
  {
    title: "Ogek Wali",
    category: "web",
    kind: "Full Stack Web App",
    cat: "Public Service Information System",
    image: "images/ogek-wali.png",
    url: "https://webpengaduan.site.je/",
    tech: ["Laravel", "PHP", "MySQL"],
    tags: ["Information System", "Public Service", "Database Management"],
    text:
      "A public complaint system for Sibolga City. Citizens submit and " +
      "track reports; administrators manage complaints, follow-ups, and" +
      " supporting information.",
  },
  {
    title: "Neon Eclipse",
    category: "web",
    kind: "Landing Page",
    cat: "Event & Entertainment",
    image: "images/neon-eclipse.png",
    url: "https://neoneclipse.netlify.app/",
    tech: ["React", "TypeScript", "Vite"],
    tags: ["Interactive UI", "Audio Visualizer", "Design System"],
    text:
      "A single-page concert site for the fictional festival Neon " +
      "Eclipse, with an artist lineup, audio visualizer, event " +
      "schedule, and ticket waitlist.",
  },
  {
    title: "Island Hopper",
    category: "web",
    kind: "Landing Page",
    cat: "Travel & Tourism",
    image: "images/island-hopper.png",
    url: "https://island-hopper-zeta.vercel.app/",
    tech: ["React", "TypeScript", "Vite"],
    tags: ["Travel Planning", "Interactive UI", "Responsive Design"],
    text:
      "A travel platform for discovering island destinations, exploring" +
      " itineraries, planning routes, and organizing trips across " +
      "Indonesia.",
  },
  {
    title: "Topup.gg",
    category: "web",
    kind: "Landing Page",
    cat: "Gaming & E-Commerce",
    image: "images/topupgg.png",
    url: "https://topupgg-gamma.vercel.app/",
    tech: ["React", "Vite", "Tailwind CSS"],
    tags: ["E-Commerce", "Gaming", "Responsive UI"],
    text:
      "A game top-up website for a fast, convenient way to buy " +
      "diamonds, UC, and other in-game currencies.",
  },
  {
    title: "Nusantara Catering",
    category: "web",
    kind: "Landing Page / Catalog",
    cat: "Food & Catering",
    image: "images/nusantara-catering.png",
    url: "https://padskieee.github.io/NusantaraCatering/",
    tech: ["HTML", "CSS", "JavaScript"],
    tags: ["Business Website", "Responsive Design", "UI Development"],
    text:
      "A responsive catering website showcasing menus, services, and " +
      "company information.",
  },
  {
    title: "Taskly",
    category: "uiux",
    kind: "Web UI/UX Design",
    cat: "Productivity Platform",
    image: "images/taskly.jpg",
    url: "https://www.figma.com/design/BkIki1rvK3D11NheGAZkVM/Taskly-Web?node-id=16-34&p=f&t=mPkHvKGzGTygFmwG-0",
    tech: ["Figma"],
    tags: ["UI/UX Design", "Productivity", "Task Management"],
    text:
      "A task management platform concept for organizing tasks and " +
      "daily activities through a clean, intuitive interface.",
  },
  {
    title: "X-ERCISE",
    category: "uiux",
    kind: "Mobile App UI/UX",
    cat: "Fitness & Health",
    image: "images/x-ercise.jpg",
    url: "https://www.figma.com/design/NzftHeMZVSBzJPad4R4TBN/X-ERCISE?node-id=0-1&p=f&t=jMdzddwje35UrNbi-0",
    tech: ["Figma"],
    tags: ["Mobile App", "Fitness", "UI/UX Design"],
    text:
      "A mobile fitness app concept for tracking workouts and physical " +
      "activity with an intuitive experience.",
  },
];

const SERVICES = [
  {
    title: "Web Development",
    scope: "React / Laravel / PHP / MySQL / Tailwind CSS",
    text:
      "Responsive websites and web applications, from landing pages to " +
      "database-backed systems.",
    out: "Web apps, landing pages, business websites.",
  },
  {
    title: "Data Analysis",
    scope: "Excel / Dashboards / Chart.js / Data visualization",
    text:
      "Turning raw data into dashboards and summaries that people can " +
      "act on. I recently started learning Excel and I'm building " +
      "towards a career as a data analyst.",
    out: "HR-Insight, FinTrack, ProfitRiddle, Arus.",
  },
  {
    title: "UI/UX Design",
    scope: "Interface design / Prototypes / Figma",
    text:
      "Interface concepts for web and mobile, designed in Figma before " +
      "they are built.",
    out: "Taskly (web), X-ERCISE (mobile).",
  },
];

const CERTS = [
  { title: "Google Analytics Certification (2026)", issuer: "Google", date: "2026-10-29", image: "images/certs/google-analytics.jpg", pdf: "images/certs/google-analytics.jpg" },
  { title: "Data Analyst untuk Persiapan Sertifikasi BNSP", issuer: "YEC.co.id", date: "2026-10-22", image: "images/certs/data-analyst-yec.jpg", pdf: "certs/data-analyst-yec.pdf" },
  { title: "The Complete Microsoft Excel Course: Master All Levels", issuer: "Udemy", date: "2026-10-18", image: "images/certs/excel-udemy.jpg", pdf: "certs/excel-udemy.pdf" },
  { title: "TOEFL ITP Certificate of Achievement (Score 473)", issuer: "The TOEFL Program / Universitas Brawijaya", date: "2026-05-19", image: "images/certs/toefl-itp.jpg", pdf: "certs/toefl-itp.pdf" },
  { title: "Pemrogram Basisdata (Database Programmer)", issuer: "BNSP / LSP Teknologi Digital", date: "2026-01-20", image: "images/certs/bnsp-database-programmer.jpg", pdf: "certs/bnsp-database-programmer.pdf" },
  { title: "LIA Preparation Course for the IELTS Test", issuer: "Lembaga Bahasa LIA", date: "2025-12-11", image: "images/certs/lia-ielts-course.jpg", pdf: "certs/lia-ielts-course.pdf" },
  { title: "Microsoft Office Desktop Application", issuer: "Trust Training Partners", date: "2025-12-04", image: "images/certs/microsoft-office-trust.jpg", pdf: "certs/microsoft-office-trust.pdf" },
];

const LINKS = [
  ["about", "#about"],
  ["projects", "#projects"],
  ["skills", "#skills"],
  ["certificates", "#certificates"],
  ["contact", "#contact"],
];

const CSS = `
@font-face {
  font-family: MonaSemi;
  src: url("https://cdn.jsdelivr.net/gh/github/mona-sans@main/fonts/webfonts/static/MonaSansSemiCondensed-ExtraLight.woff2")
    format("woff2");
  font-weight: 250;
  font-display: swap;
}
@font-face {
  font-family: MonaSemi;
  src: url("https://cdn.jsdelivr.net/gh/github/mona-sans@main/fonts/webfonts/static/MonaSansSemiCondensed-Medium.woff2")
    format("woff2");
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: Mona;
  src: url("https://cdn.jsdelivr.net/gh/github/mona-sans@main/fonts/webfonts/static/MonaSans-Regular.woff2")
    format("woff2");
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: MonaVar;
  src: url("${asset("fonts/mona-sans-latin-wdth-normal.woff2")}")
    format("woff2-variations");
  font-weight: 200 900;
  font-stretch: 75% 125%;
  font-display: swap;
}
.pf .vp-mona {
  font-family: MonaVar, MonaSemi, "Arial Narrow", Arial, sans-serif;
  font-stretch: 87.5%;
}

.pf {
  --orange: #ff630f;
  --muted: #949494;
  --muted3: #b8b8b8;
  --d: MonaSemi, "Arial Narrow", Arial, sans-serif;
  --u: "PP Neue Montreal", Arial, sans-serif;
  --b: Mona, Arial, sans-serif;
  background: #000;
  color: #fff;
  font-family: var(--b);
  line-height: 1.35;
  overflow-x: hidden;
}
.pf * {
  box-sizing: border-box;
}
.pf a {
  color: inherit;
  text-decoration: none;
}
.pf button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}
.pf ::selection {
  background: var(--orange);
  color: #000;
}
.pf :focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 6px;
}
.pf .u {
  font: 400 12px/1.2 var(--u);
  letter-spacing: 0.075em;
  text-transform: uppercase;
}
.pf .muted {
  color: var(--muted);
}
.pf .or {
  color: var(--orange);
}
.pf .pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 16px 20px;
  border-radius: 999px;
  background: #fff;
  color: #000;
  font: 400 18px/1 var(--u);
  transition:
    background-color 0.35s ease,
    color 0.35s ease,
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf .pill:hover,
.pf .pill:focus-visible {
  background: var(--orange);
  transform: scale(1.04);
}
.pf .pill:active {
  transform: scale(0.98);
}
.skip {
  position: fixed;
  z-index: 1000;
  top: 12px;
  left: 12px;
  transform: translateY(-160%);
  padding: 11px 16px;
  background: var(--orange);
  color: #000;
  border-radius: 999px;
}
.skip:focus {
  transform: none;
}
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.pf .cert { min-height: 0; padding-bottom: 60px; }
.pf .cert-stage { margin-top: 36px; height: clamp(480px, 48vw, 680px); }
.pf .cert-bar {
  display: flex; justify-content: space-between; align-items: center; gap: 20px;
  margin-top: 8px; color: var(--muted); font: 400 14px var(--u);
}
@media (max-width: 700px) {
  .pf .cert-stage { height: 530px; margin-top: 24px; }
  .pf .cert-bar { flex-direction: column; align-items: flex-start; margin-top: 14px; }
}

/* hero */
.hero {
  position: relative;
  isolation: isolate;
  min-height: 900px;
  height: min(1100px, 100svh);
  overflow: hidden;
  container-type: inline-size;
}
.hero-bg {
  position: absolute;
  inset: 0 -3% -4%;
  transform-origin: 50% 0;
  background-color: #080808;
  background-image: var(--img);
  background-position: 50% 0;
  background-size: cover;
  background-repeat: no-repeat;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  transform: scale(var(--z, 1)) translateY(var(--py, 0%));
}
.hero-ov {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.5),
    rgba(0, 0, 0, 0.08) 35%,
    rgba(0, 0, 0, 0.18) 57%,
    rgba(0, 0, 0, 0.55)
  );
}
.nav {
  position: absolute;
  z-index: 6;
  top: max(28px, env(safe-area-inset-top, 0px));
  left: 3%;
  right: 3%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  animation: navIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes navIn {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
}
.clock {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--u);
  font-variant-numeric: tabular-nums;
}
.clock small {
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0.09em;
}
.clock span {
  font-size: 16px;
}
.nav .pill {
  justify-self: end;
  margin-right: 140px;
}
.ident {
  position: absolute;
  z-index: 2;
  top: 147px;
  left: 3%;
  right: 3%;
  container-type: inline-size;
}
.ht {
  margin: 0;
  display: flex;
  justify-content: space-between;
  gap: 3%;
  font: 500 clamp(38px, 13.5cqw, 205px)/0.727 var(--d);
  letter-spacing: -0.06em;
  white-space: nowrap;
}
.mono,
.nm {
  display: flex;
  align-items: baseline;
}
.nm {
  flex: 0 1 62%;
  justify-content: flex-end;
  padding-right: 28px;
  font-weight: 250;
  position: relative;
}
.nm .f {
  font-weight: 500;
}
.nm sup {
  position: absolute;
  right: 0;
  top: 0.05em;
  font: 400 clamp(10px, 1.5cqw, 23px)/1 var(--u);
  letter-spacing: 0;
  opacity: 0;
  animation: fi 0.5s 1.48s both;
}
.lt {
  display: inline-block;
  opacity: 0;
  animation: lIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--dl);
}
@keyframes lIn {
  0% {
    opacity: 0;
    transform: translateY(115%) rotate(3deg) scale(0.96);
    filter: blur(32px);
  }
  65% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
@keyframes fi {
  to {
    opacity: 1;
  }
}
@keyframes fu {
  from {
    opacity: 0;
    transform: translateY(56px);
  }
}
.sub {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 35px;
  font: 400 13px/1.2 var(--u);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  animation: fu 0.5s 1.18s both;
}
.arrow {
  position: absolute;
  left: 70%;
  top: calc(100% + 0px);
  margin-top: -8px;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.32);
  display: grid;
  place-items: center;
}
.arrow svg {
  width: 25px;
  height: 25px;
  animation: bn 1.9s cubic-bezier(0.45, 0, 0.3, 1) infinite;
}
.arrow:hover,
.arrow:focus-visible {
  background: var(--orange);
  border-color: var(--orange);
  color: #000;
}
.arrow:hover svg {
  animation-play-state: paused;
}
@keyframes bn {
  0%,
  70%,
  100% {
    transform: translateY(-3px);
  }
  35% {
    transform: translateY(5px);
  }
}
.notes {
  position: absolute;
  z-index: 2;
  left: 3%;
  bottom: 40px;
  width: min(420px, 42vw);
  display: flex;
  flex-direction: column;
  gap: 8px;
  font: 400 18px/1.13 var(--u);
  animation: fu 0.5s 1.55s both;
}
.notes p {
  margin: 0;
}
.notes p + p {
  color: var(--muted);
}
.hx {
  position: absolute;
  z-index: 2;
  right: 3%;
  bottom: 34px;
  animation: fu 0.5s 2.075s both;
}
.vl {
  position: absolute;
  z-index: 2;
  right: 3%;
  top: 52%;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font: 400 10px/1 var(--u);
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.68);
}
/* about */
.about {
  min-height: 900px;
  padding: 40px 3% 70px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #333;
  container-type: inline-size;
}
.eb {
  font: 400 18px/1 var(--u);
}
.st {
  margin: 65px 0 0;
  max-width: 1440px;
  font: 500 clamp(30px, 6.7cqw, 96px)/0.98 var(--d);
  letter-spacing: -0.04em;
}
.st span {
  display: block;
  transition:
    opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.js .st span {
  opacity: 0;
  transform: translateY(60%);
}
.js .rv.in .st span {
  opacity: 1;
  transform: none;
}
.st span:nth-child(2) {
  transition-delay: 0.11s;
}
.st span:nth-child(3) {
  transition-delay: 0.22s;
}
.st span:nth-child(4) {
  transition-delay: 0.33s;
}
.meta {
  margin-top: auto;
  padding-top: 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8%;
  font: 400 18px/1.25 var(--u);
}
.meta p {
  margin: 0 0 18px;
  max-width: 620px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.tag {
  border: 1px solid #777;
  border-radius: 99px;
  padding: 10px 14px;
  color: var(--muted3);
  font-size: 14px;
}

.sh {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

/* work */
.work {
  min-height: 760px;
  padding: 40px 4% 86px;
  background: linear-gradient(
    180deg,
    #000 0%,
    #000 48%,
    #ea4f16 78%,
    #f6af60 100%
  );
}
.grid {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 260px 40px;
  gap: 16px;
  align-items: center;
}
.th {
  color: var(--muted);
  font: 400 14px var(--u);
  text-transform: uppercase;
  padding: 18px 0 0;
}
.row {
  width: 100%;
  position: relative;
  isolation: isolate;
  min-height: 72px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.42);
  text-align: left;
  font-family: var(--u);
  background: rgba(0, 0, 0, 0.73);
  transition: color 0.25s;
}
.row::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  background: #fff;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.row:hover::before,
.row:focus-visible::before {
  transform: none;
}
.row:hover,
.row:focus-visible {
  color: #000;
  z-index: 5;
}
.row:hover .d,
.row:focus-visible .d {
  color: #333;
}
.row .t {
  font-size: 24px;
  line-height: 1.05;
}
.row .d,
.row .i {
  font-size: 14px;
}
.row .d {
  color: var(--muted3);
}
.row .a {
  font-size: 25px;
  transition: transform 0.3s;
}
.row:hover .a {
  transform: translateX(5px);
}
.pv {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 50%;
  height: 150px;
  width: auto;
  max-width: 280px;
  object-fit: contain;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  transform: translate(-50%, -50%) scale(0.96);
  filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.42s,
    transform 0.42s,
    filter 0.42s;
}
.row:hover .pv,
.row:focus-visible .pv {
  opacity: 1;
  transform: translate(-50%, -50%);
  filter: none;
}
.wb {
  padding-top: 85px;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  font: 400 18px var(--u);
}

/* services */
.svc {
  min-height: 680px;
  padding: 60px 3% 50px;
  container-type: inline-size;
  border-top: 1px solid #333;
}
.sh2 {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  font: 500 clamp(30px, 6.4cqw, 86px)/1 var(--d);
  letter-spacing: -0.045em;
}
.sh2 h2 {
  font: inherit;
  margin: 0;
}
.sh2 h2 > span {
  display: block;
}
.at-w {
  display: inline-block;
  white-space: nowrap;
}
.at-c {
  display: inline-block;
  transition:
    opacity var(--atd, 0.6s) ease-out,
    transform var(--atd, 0.6s) ease-out;
}
.js .at-c {
  opacity: 0;
  transform: translateY(var(--aty, 10px));
}
.js .at.in .at-c {
  opacity: 1;
  transform: none;
}
.sh2 .k {
  font: 400 14px var(--u);
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-top: 11px;
}
/* skills section with Dither background */
.svc-skills {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: #000000;
}
.skills-dither-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 1;
}
.svc-skills > *:not(.skills-dither-bg) {
  position: relative;
  z-index: 1;
}

/* skills section modern open design (no boxy cards) */
.sk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  margin-top: 56px;
}
.sk-col {
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  padding-top: 28px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.35s ease;
}
.sk-col:hover {
  border-color: var(--orange);
}
.sk-col-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 22px;
}
.sk-num {
  font: 400 13px var(--u);
  color: var(--muted);
  letter-spacing: 0.12em;
}
.sk-icon {
  display: flex;
  align-items: center;
  color: var(--muted);
  transition: color 0.3s ease, transform 0.3s ease;
}
.sk-col:hover .sk-icon {
  color: var(--orange);
  transform: scale(1.15);
}
.sk-icon svg {
  width: 22px;
  height: 22px;
}
.sk-title {
  margin: 0 0 16px;
  font: 500 clamp(24px, 2.2cqw, 34px)/1.05 var(--d);
  letter-spacing: -0.03em;
}
.sk-title span {
  display: block;
}
.sk-title .or {
  color: var(--orange);
}
.sk-desc {
  font: 400 14px/1.65 var(--b);
  color: var(--muted3);
  margin: 0 0 28px;
  min-height: 46px;
}
.sk-group {
  margin-bottom: 24px;
}
.sk-label {
  font: 400 11px var(--u);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 10px;
}
.sk-tools-list {
  font: 400 13.5px/1.7 var(--u);
  color: #e2e2e2;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.sk-tool-item {
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}
.sk-tool-item:hover {
  color: var(--orange);
}
.sk-sep {
  margin: 0 8px;
  color: #555;
  user-select: none;
}

/* Marquee track - pure white floating logos without cards */
.marquee-wrap {
  position: relative;
  overflow: hidden;
  margin-top: 68px;
  padding: 26px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
.marquee-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: marqueeScroll 45s linear infinite;
  will-change: transform;
}
.marquee-track:hover {
  animation-play-state: paused;
}
@keyframes marqueeScroll {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-50%, 0, 0);
  }
}
.marquee-logo-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 34px;
  color: #ffffff;
  flex-shrink: 0;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.marquee-logo-item svg {
  width: 32px;
  height: 32px;
  fill: #ffffff;
  color: #ffffff;
  transition: transform 0.25s ease;
}
.marquee-logo-item:hover {
  opacity: 1;
  transform: scale(1.22);
}

@media (max-width: 980px) {
  .sk-grid {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-top: 42px;
  }
  .sk-desc {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .svc-skills {
    padding: 48px 4% 36px;
    min-height: auto;
  }
  .sk-grid {
    gap: 26px;
    margin-top: 32px;
  }
  .sk-col {
    padding-top: 18px;
  }
  .sk-col-header {
    margin-bottom: 14px;
  }
  .sk-title {
    font-size: 26px;
    margin-bottom: 12px;
  }
  .sk-desc {
    font-size: 13.5px;
    margin-bottom: 20px;
    min-height: auto;
  }
  .sk-tools-list {
    font-size: 12.5px;
    line-height: 1.65;
  }

  .marquee-wrap {
    margin-top: 40px;
    padding: 16px 0;
  }
  .marquee-logo-item {
    padding: 0 18px;
  }
  .marquee-logo-item svg {
    width: 24px;
    height: 24px;
  }
}
/* contact */
.ct {
  padding: 110px 3% 36px;
  border-top: 1px solid #333;
  container-type: inline-size;
}
.ct h2 {
  margin: 42px 0 0;
  font: 500 clamp(38px, 8.5cqw, 116px)/0.9 var(--d);
  letter-spacing: -0.04em;
}
.ct h2 span {
  display: block;
}
.cg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8%;
  margin-top: 65px;
}
.cc {
  max-width: 480px;
  font: 400 20px/1.22 var(--u);
}
.cc p {
  margin: 0;
}
.cc .s {
  margin-top: 30px;
  color: var(--muted);
  font-size: 13px;
}
.em {
  text-decoration: underline;
  text-decoration-color: var(--orange);
  text-underline-offset: 5px;
  font: 400 17px var(--u);
}
.so {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  margin-top: 24px;
  font: 400 14px var(--u);
}
.so a {
  color: var(--muted3);
}
.so a:hover {
  color: var(--orange);
}
.ft2 {
  margin-top: 100px;
  padding-top: 15px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font: 400 14px var(--u);
}
.ft2 .ds {
  color: var(--muted);
  margin-top: 16px;
}
/* dialog */
.pf dialog {
  border: 1px solid #444;
  background: #101010;
  color: #f2f0e9;
  width: min(1040px, calc(100vw - 32px));
  max-height: calc(100svh - 32px);
  padding: 0;
  overflow: hidden;
  margin: auto;
}
.pf dialog[open] {
  animation: dlgIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.pf dialog.closing {
  animation: dlgOut 0.26s ease-in both;
}
/* the page behind the open project is dimmed and blurred */
.pf dialog::backdrop {
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}
.pf dialog[open]::backdrop {
  animation: bdIn 0.45s ease both;
}
.pf dialog.closing::backdrop {
  animation: bdOut 0.26s ease both;
}
.pf dialog[open] .cs > * {
  animation: dlgItem 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.pf dialog[open] .cs > .ctb {
  animation: none;
}
.pf dialog[open] .cs > :nth-child(2) {
  animation-delay: 0.08s;
}
.pf dialog[open] .cs > :nth-child(3) {
  animation-delay: 0.14s;
}
.pf dialog[open] .cs > :nth-child(4) {
  animation-delay: 0.2s;
}
.pf dialog[open] .cs > :nth-child(5) {
  animation-delay: 0.26s;
}
.pf dialog[open] .cs > :nth-child(6) {
  animation-delay: 0.32s;
}
.pf dialog[open] .cs > :nth-child(n + 7) {
  animation-delay: 0.38s;
}
@keyframes dlgIn {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.97);
  }
}
@keyframes dlgOut {
  to {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
}
@keyframes dlgItem {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
}
@keyframes bdIn {
  from {
    opacity: 0;
    -webkit-backdrop-filter: blur(0);
    backdrop-filter: blur(0);
  }
}
@keyframes bdOut {
  to {
    opacity: 0;
    -webkit-backdrop-filter: blur(0);
    backdrop-filter: blur(0);
  }
}
.cs {
  max-height: calc(100svh - 32px);
  overflow: auto;
  padding: 0 28px 44px;
}
.ctb {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  background: rgba(16, 16, 16, 0.95);
  border-bottom: 1px solid #333;
  font: 400 12px var(--u);
  letter-spacing: 0.08em;
  color: var(--muted);
}
.cx {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid #555 !important;
  border-radius: 50%;
  font-size: 22px;
}
.cx:hover {
  background: var(--orange);
  color: #000;
  border-color: var(--orange) !important;
}
.cs h2 {
  margin: 36px 0 12px;
  font: 500 clamp(40px, 6vw, 82px)/0.88 var(--d);
  letter-spacing: -0.05em;
}
.cs .sm {
  max-width: 720px;
  font: 400 20px/1.25 var(--u);
}
.cs .art {
  margin: 36px auto;
  max-width: 640px;
}
.cs .art img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid #333;
}
.cm {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #444;
  border-bottom: 1px solid #444;
  margin: 26px 0 35px;
}
.cm div {
  padding: 15px 16px;
}
.cm div:first-child {
  padding-left: 0;
  border-right: 1px solid #444;
}
.cm dt {
  color: var(--muted);
  font: 400 11px var(--u);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.cm dd {
  margin: 5px 0 0;
  font: 400 16px var(--u);
}
.cp {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid #333;
}
.cp h3 {
  margin: 0;
  color: var(--orange);
  font: 400 13px var(--u);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.cp p {
  margin: 0;
  color: var(--muted3);
  font: 400 17px/1.35 var(--b);
}
@media (max-width: 1200px) {
  .about {
    min-height: 820px;
  }





}
@media (max-width: 900px) {
  .hero {
    height: 100svh;
    min-height: 760px;
  }
  .vl {
    display: none;
  }
  .sub {
    font-size: 11px;
  }
  .notes {
    font-size: 16px;
    width: 54vw;
  }






  .th {
    display: none;
  }
  .grid {
    grid-template-columns: 42px minmax(0, 1fr) 40px;
  }
  .row .d {
    grid-column: 2;
    grid-row: 2;
  }
  .row .a {
    grid-column: 3;
    grid-row: 1;
  }
  .pv {
    display: none;
  }
  .sg {
    grid-template-columns: 42px minmax(0, 1fr) 140px;
  }
  .sg .sc {
    grid-column: 2;
  }
  .sg .tg {
    grid-column: 3;
    grid-row: 1 / span 2;
  }
  .sh2 {
    flex-direction: column;
  }
  .sh2 .k {
    align-self: flex-end;
  }
}
@media (max-width: 700px) {
  .ht {
    font-size: 15cqw;
  }
  .ident {
    top: 150px;
  }
  .nm {
    padding-right: 22px;
  }
  .sub {
    margin-top: 24px;
    font-size: 10px;
    align-items: flex-start;
  }
  .about {
    min-height: 0;
  }
  .st {
    margin-top: 45px;
    font-size: clamp(30px, 9cqw, 47px);
  }
  .meta {
    margin-top: 55px;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    gap: 36px;
  }
  .tags {
    justify-content: flex-start;
  }

  .work {
    padding-inline: 3%;
  }
  .wb {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 55px;
  }
  .sg {
    grid-template-columns: 24px minmax(0, 1fr) 110px;
  }
  .sr2 .t {
    font-size: 20px;
  }
  .sr2 .sc {
    font-size: 14px;
  }
  .sp {
    grid-column: 2/4;
  }
  .notes2 {
    flex-direction: column;
    gap: 9px;
  }
  .ct {
    padding-top: 65px;
  }
  .ct h2 {
    font-size: 11.4cqw;
  }
  .cg {
    display: flex;
    flex-direction: column;
    gap: 34px;
  }
  .ft2 {
    margin-top: 65px;
    flex-direction: column;
  }
  .cs {
    padding-inline: 18px;
  }
  .cm {
    grid-template-columns: 1fr;
  }
  .cm div:first-child {
    border-right: 0;
  }
  .cm div {
    padding-left: 0 !important;
  }
  .cp {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
@media (max-width: 560px) {
  .hero {
    min-height: max(720px, 100svh);
    height: auto;
  }
  .nav {
    top: max(20px, env(safe-area-inset-top, 0px));
  }
  .clock small {
    font-size: 10px;
  }
  .clock span {
    font-size: 14px;
  }
  .nav .pill {
    min-height: 44px;
    padding: 14px 16px;
    font-size: 16px;
    margin-right: 118px;
  }
  .ident {
    top: 145px;
  }
  .notes {
    bottom: 105px;
    width: 90%;
    font-size: 16px;
  }
  .hx {
    left: 3%;
    right: auto;
    bottom: 28px;
  }
  .arrow {
    width: 46px;
    height: 46px;
  }
  .grid {
    grid-template-columns: 24px minmax(0, 1fr) 24px;
    gap: 9px;
  }
  .row .t {
    font-size: 20px;
  }
}
.pf .cur {
  position: fixed;
  z-index: 50;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}
.pf .lang {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 50px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.pf .lang button {
  min-width: 40px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 999px;
  font: 400 14px/1 var(--u);
  letter-spacing: 0.04em;
  color: #fff;
  transition:
    background 0.2s,
    color 0.2s;
}
.pf .lang button:hover {
  background: rgba(255, 255, 255, 0.18);
}
.pf .lang button.on {
  background: #fff;
  color: #000;
}
.pf .em {
  overflow-wrap: anywhere;
}
.pf .so a {
  display: inline-block;
  padding: 10px 0;
}
.pf dialog {
  overscroll-behavior: contain;
}
@media (max-width: 560px) {
  .pf .nav .pill {
    display: none;
  }
}
/* smooth hover: a default for every link and button that has no transition of its own */
:where(.pf) a,
:where(.pf) button {
  transition-property:
    color, background-color, border-color, opacity, transform, box-shadow;
  transition-duration: 0.35s;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
.pf .tag {
  transition:
    color 0.3s ease,
    border-color 0.3s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.pf .tag:hover {
  color: #fff;
  border-color: var(--orange);
  transform: translateY(-3px);
}
.pf .row .t {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf .row:hover .t,
.pf .row:focus-visible .t {
  transform: translateX(12px);
}
.pf .row .d {
  transition: color 0.35s ease;
}
.pf .sr2 {
  transition: background-color 0.4s ease;
}
.pf .sr2:hover {
  background: rgba(255, 255, 255, 0.04);
}
.pf .sr2 .t {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf .sr2:hover .t {
  transform: translateX(10px);
}
.pf .tg:hover,
.pf .tg:focus-visible {
  background: #ff8849;
  transform: scale(1.06);
}
.pf .em {
  transition:
    text-underline-offset 0.35s ease,
    color 0.35s ease;
}
.pf .em:hover {
  text-underline-offset: 9px;
  color: var(--orange);
}
.pf .so a {
  transition:
    color 0.3s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.pf .so a:hover {
  transform: translateY(-2px);
}
.pf .ft2 a {
  transition: color 0.3s ease;
}
.pf .ft2 a:hover {
  color: var(--orange);
}
@media (prefers-reduced-motion: reduce) {
  .pf * {
    animation: none !important;
    transition: none !important;
  }
  .lt,
  .nm sup {
    opacity: 1 !important;
  }
  .js .at-c {
    opacity: 1 !important;
    transform: none !important;
  }
  .pf dialog::backdrop {
    animation: none !important;
  }

}
`;

const VS = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * .5 + .5;
  gl_Position = vec4(position, 0., 1.);
}`;
const FS = (prec) => `precision ${prec} float;
varying vec2 vUv;
uniform sampler2D image;
uniform vec2 resolution, imageSize, mouse, trail[9];
uniform float strength, time;
uniform vec2 focus;

vec2 coverUv(vec2 uv) {
  float rs = resolution.x / resolution.y;
  float ims = imageSize.x / imageSize.y;
  vec2 scale = rs < ims ? vec2(rs / ims, 1.) : vec2(1., ims / rs);
  return uv * scale + (1. - scale) * vec2(focus.x, 1. - focus.y);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(resolution.x / resolution.y, 1.);
  vec2 delta = (uv - mouse) * aspect;
  float dist = length(delta);
  float radius = .47;
  float falloff = (1. - smoothstep(0., radius, dist)) * strength;
  vec2 dir = delta / (dist + .0001);
  vec2 tangent = vec2(-dir.y, dir.x);

  float wave = sin(dist * 38. - time * 2.15) * falloff;
  float secondary = sin(dist * 19. + time * .7) * falloff;
  vec2 displacement = dir * (wave * .00525 + falloff * .004);
  displacement += tangent * secondary * .001875;
  vec2 sampleUv = coverUv(uv + displacement);

  float aberration = falloff * .0016 + abs(wave) * .0012;
  vec2 rgbShift = dir * aberration;
  float r = texture2D(image, sampleUv + rgbShift).r;
  float g = texture2D(image, sampleUv).g;
  float b = texture2D(image, sampleUv - rgbShift).b;
  vec3 color = vec3(r, g, b);

  vec3 orange = vec3(1., .22, .025);
  float glow = falloff * (.10 + .08 * (sin(dist * 28. - time * 1.5) * .5 + .5));
  float trailGlow = 0.;
  for (int i = 0; i < 9; i++) {
    vec2 td = (uv - trail[i]) * aspect;
    float tdist = length(td);
    float age = 1. - float(i) / 9.;
    float halo = exp(-tdist * tdist * 145.);
    float core = exp(-tdist * tdist * 420.);
    float shimmer = .82 + .18 * sin(time * 2. - float(i) * .72);
    trailGlow += (halo * .48 + core * .28) * age * age * shimmer;
  }
  float headProtection = smoothstep(.035, .105, dist);
  trailGlow = min(trailGlow, 1.35) * strength * headProtection;

  vec3 trailOrange = vec3(1., .31, .045);
  vec3 trailGold = vec3(1., .58, .20);
  color += orange * glow;
  color += trailOrange * trailGlow * .46;
  color += trailGold * pow(trailGlow, 1.65) * .11;
  gl_FragColor = vec4(color, 1.);
}`;

function HeroGL({ heroRef, src }) {
  const cv = useRef(null);
  useEffect(() => {
    const hero = heroRef.current,
      canvas = cv.current;
    if (!hero || !canvas) return;
    if (
      !matchMedia("(min-width:769px) and (pointer:fine)").matches ||
      matchMedia("(prefers-reduced-motion:reduce)").matches
    )
      return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;
    const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const sh = (t, c) => {
      const o = gl.createShader(t);
      gl.shaderSource(o, c);
      gl.compileShader(o);
      return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VS),
      fs = sh(
        gl.FRAGMENT_SHADER,
        FS(hp && hp.precision > 0 ? "highp" : "mediump"),
      );
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pl = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pl);
    gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);

    const tgt = { x: 0.5, y: 0.5 },
      cur = { x: 0.5, y: 0.5 };
    const trail = Array.from({ length: 9 }, () => ({ x: 0.5, y: 0.5 }));
    let s = 0,
      ts = 0,
      raf = 0,
      ready = false,
      shown = false,
      visible = true,
      tex = null;
    const t0 = performance.now();

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2.25);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * d));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * d));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U("resolution"), canvas.width, canvas.height);
      if (ready) draw();
    };
    const draw = () => {
      gl.uniform2f(U("mouse"), cur.x, cur.y);
      gl.uniform2fv(
        U("trail"),
        new Float32Array(trail.flatMap((p) => [p.x, p.y])),
      );
      gl.uniform1f(U("strength"), s);
      gl.uniform1f(U("time"), (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!shown) {
        shown = true;
        canvas.style.opacity = 1;
      }
    };
    const frame = () => {
      raf = 0;
      cur.x += (tgt.x - cur.x) * 0.075;
      cur.y += (tgt.y - cur.y) * 0.075;
      s += (ts - s) * (ts ? 0.07 : 0.028);
      if (s < 0.001 && !ts) s = 0;
      trail.forEach((p, i) => {
        const q = i ? trail[i - 1] : cur,
          k = 0.19 - i * 0.009;
        p.x += (q.x - p.x) * k;
        p.y += (q.y - p.y) * k;
      });
      draw();
      if (s > 0 || ts) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && ready && visible && !document.hidden)
        raf = requestAnimationFrame(frame);
    };

    const img = new Image();
    img.onload = () => {
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.uniform1i(U("image"), 0);
        gl.uniform2f(U("imageSize"), img.naturalWidth, img.naturalHeight);
        // same focal point as the CSS background-position (50% 0): top-aligned
        gl.uniform2f(U("focus"), 0.5, 0.0);
        ready = true;
        resize();
      } catch (e) {
        /* keep CSS portrait */
      }
    };
    img.src = src;

    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      tgt.x = (e.clientX - r.left) / r.width;
      tgt.y = 1 - (e.clientY - r.top) / r.height;
      ts = 1;
      kick();
    };
    const leave = () => {
      ts = 0;
      kick();
    };
    const lost = (e) => {
      e.preventDefault();
      ready = false;
      cancelAnimationFrame(raf);
      canvas.style.opacity = 0;
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else kick();
    });
    io.observe(hero);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
    canvas.addEventListener("webglcontextlost", lost);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", kick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", lost);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", kick);
      if (tex) gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [heroRef, src]);
  return (
    <canvas
      ref={cv}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        transition: "opacity .45s",
        pointerEvents: "none",
      }}
    />
  );
}

function Cursor() {
  const dot = useRef(null);
  useEffect(() => {
    if (
      !matchMedia("(pointer:fine)").matches ||
      matchMedia("(prefers-reduced-motion:reduce)").matches
    )
      return;
    let raf = 0,
      pos = null;
    const paint = () => {
      raf = 0;
      dot.current.style.transform = `translate3d(${pos.clientX}px,${pos.clientY}px,0) translate(-50%,-50%)`;
      dot.current.style.opacity = 1;
    };
    const move = (e) => {
      pos = e;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const out = () => {
      dot.current.style.opacity = 0;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseleave", out);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", out);
    };
  }, []);
  return <div ref={dot} className="cur" aria-hidden="true" />;
}

const Letters = ({ text, start, cls }) =>
  text.split("").map((c, i) => (
    <span
      key={i}
      className={`lt ${cls || ""}`}
      style={{ "--dl": `${(start + i * 0.1).toFixed(2)}s` }}
    >
      {c}
    </span>
  ));

const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = () => !document.hidden && setNow(new Date());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const off = -now.getTimezoneOffset();
  const s = off < 0 ? "-" : "+";
  const a = Math.abs(off);
  const p = (n) => String(n).padStart(2, "0");
  return {
    zone: `GMT${s}${p(Math.floor(a / 60))}:${p(a % 60)} // LOCAL`,
    time: `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`,
  };
};

// Letter-by-letter heading: each letter rises 10px and fades in, 0.05s apart.
// Same motion as the AnimatedText reference, without needing the motion package.
function AnimatedText({
  lines,
  duration = 0.6,
  stagger = 0.05,
  initialY = 10,
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let n = 0;
  return (
    <h2
      ref={ref}
      className={`at${shown ? " in" : ""}`}
      aria-label={lines.map((l) => l.text).join(" ")}
      style={{ "--aty": `${initialY}px`, "--atd": `${duration}s` }}
    >
      {lines.map((line, li) => (
        <span className={line.className} aria-hidden="true" key={li}>
          {line.text.split(" ").map((word, wi) => (
            <React.Fragment key={wi}>
              <span className="at-w">
                {word.split("").map((ch, ci) => (
                  <span
                    className="at-c"
                    style={{
                      transitionDelay: `${(n++ * stagger).toFixed(2)}s`,
                    }}
                    key={ci}
                  >
                    {ch}
                  </span>
                ))}
              </span>{" "}
            </React.Fragment>
          ))}
        </span>
      ))}
    </h2>
  );
}

function LangSwitch({ lang, setLang, label }) {
  return (
    <div className="lang" role="group" aria-label={label}>
      {["en", "id"].map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={l === lang ? "on" : ""}
          aria-pressed={l === lang}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const clock = useClock();
  const heroRef = useRef(null);
  const dlg = useRef(null);
  const [proj, setProj] = useState(null);
  const [heroKey, setHeroKey] = useState(0);
  const [certIdx, setCertIdx] = useState(0);
  const [certZoomed, setCertZoomed] = useState(false);
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "id") return saved;
    } catch (e) {
      /* storage unavailable */
    }
    return (navigator.language || "").toLowerCase().startsWith("id")
      ? "id"
      : "en";
  });
  const t = COPY[lang];
  const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short", year: "numeric" });
  const certItems = CERTS.map((c) => ({
    src: asset(c.image),
    alt: c.title,
    title: c.title,
    subtitle: `${c.issuer} · ${fmtDate(c.date)}`,
  }));
  const projects =
    lang === "id"
      ? PROJECTS.map((p, i) => ({ ...p, ...PROJECTS_ID[i] }))
      : PROJECTS;
  const services =
    lang === "id"
      ? SERVICES.map((s, i) => ({ ...s, ...SERVICES_ID[i] }))
      : SERVICES;

  const [openGroups, setOpenGroups] = useState({ web: true, data: false, uiux: false });
  const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  const expandAllGroups = () => setOpenGroups({ web: true, data: true, uiux: true });
  const collapseAllGroups = () => setOpenGroups({ web: false, data: false, uiux: false });
  const allOpen = Object.values(openGroups).every(Boolean);

  const projectGroups = [
    {
      id: "web",
      title: t.projCategories?.web ?? "Web Development",
      desc: t.projGroupDesc?.web,
      items: projects
        .map((p, i) => ({ ...p, originalIndex: i }))
        .filter((p) => p.category === "web"),
    },
    {
      id: "data",
      title: t.projCategories?.data ?? "Data Analysis",
      desc: t.projGroupDesc?.data,
      items: projects
        .map((p, i) => ({ ...p, originalIndex: i }))
        .filter((p) => p.category === "data"),
    },
    {
      id: "uiux",
      title: t.projCategories?.uiux ?? "UI/UX Design",
      desc: t.projGroupDesc?.uiux,
      items: projects
        .map((p, i) => ({ ...p, originalIndex: i }))
        .filter((p) => p.category === "uiux"),
    },
  ];

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {
      /* storage unavailable */
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.add("js");
  }, []);

  // replay the title entrance when the hero returns after fully leaving the viewport
  useEffect(() => {
    const h = heroRef.current;
    let out = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio === 0) out = true;
        else if (out && e.intersectionRatio >= 0.2) {
          out = false;
          setHeroKey((k) => k + 1);
        }
      },
      { threshold: [0, 0.2] },
    );
    io.observe(h);
    return () => io.disconnect();
  }, []);

  // reveal sections once
  useEffect(() => {
    const els = document.querySelectorAll(".rv");
    const io = new IntersectionObserver(
      (en) =>
        en.forEach(
          (e) =>
            e.isIntersecting &&
            (e.target.classList.add("in"), io.unobserve(e.target)),
        ),
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // hero scroll parallax
  useEffect(() => {
    const onScroll = () => {
      const h = heroRef.current;
      if (!h) return;
      const r = h.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / r.height, 0), 1);
      h.style.setProperty("--py", `${p * -7}%`);
      h.style.setProperty("--z", String(1 + p * 0.2));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // case-study dialog
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (proj !== null && !d.open) d.showModal();
    if (proj === null && d.open) d.close();
  }, [proj]);

  const goto = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    el?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    el?.focus?.({ preventScroll: true });
  };

  // fade the project detail out before actually closing it
  const closeProj = () => {
    const d = dlg.current;
    if (
      !d ||
      !d.open ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setProj(null);
      return;
    }
    if (d.classList.contains("closing")) return;
    d.classList.add("closing");
    window.setTimeout(() => {
      d.classList.remove("closing");
      setProj(null);
    }, 260);
  };

  const P = proj !== null ? projects[proj] : null;

  return (
    <div className="pf">
      <style>{CSS}</style>
      <Cursor />
      <StaggeredMenu
        isFixed
        position="right"
        colors={["#ff630f", "#e9e4d8"]}
        accentColor="#ff630f"
        items={LINKS.map(([key, link]) => ({
          label: t.menu[key],
          link,
          ariaLabel: t.goTo(t.menu[key]),
        }))}
        socialItems={PERSON.socials.map(([label, link]) => ({ label, link }))}
        showLogo={false}
        changeMenuColorOnOpen={false}
        displayItemNumbering={false}
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        menuLabel={t.menuLabel}
        closeLabel={t.closeLabel}
        openAriaLabel={t.openMenuAria}
        closeAriaLabel={t.closeMenuAria}
        socialsTitle={t.socialsTitle}
        panelExtra={
          <LangSwitch lang={lang} setLang={setLang} label={t.langLabel} />
        }
        onItemClick={(e, it) => goto(e, it.link)}
      />
      <a
        className="skip"
        href="#projects"
        onClick={(e) => goto(e, "#projects")}
      >
        {t.skip}
      </a>

      <main id="top">
        {/* HERO */}
        <section
          className="hero"
          ref={heroRef}
          style={{ "--img": `url("${asset("images/profile.jpg?v=2")}")` }}
          onMouseMove={(e) => {
            if (
              !matchMedia("(pointer:fine)").matches ||
              e.target.closest("a,button")
            )
              return;
            const r = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width,
              y = (e.clientY - r.top) / r.height;
            const on = x > 0.3 && x < 0.8 && y < 0.65;
            e.currentTarget
              .querySelector(".hero-bg")
              .style.setProperty("--z", on ? "1.035" : "1");
          }}
          onMouseLeave={(e) =>
            e.currentTarget
              .querySelector(".hero-bg")
              .style.setProperty("--z", "1")
          }
        >
          <div
            className="hero-bg"
            aria-hidden="true"
            style={{ backgroundImage: `url("${asset("images/profile.jpg?v=2")}")` }}
          >
            <HeroGL heroRef={heroRef} src={asset("images/profile.jpg?v=2")} />
          </div>
          <div className="hero-ov" aria-hidden="true" />

          <header className="nav">
            <div className="clock" aria-label={t.clockLabel}>
              <small>{clock.zone}</small>
              <span>{clock.time}</span>
            </div>
          </header>

          <div className="ident">
            <h1 className="ht" key={heroKey}>
              <span className="sr">Ifadah Aulia</span>
              <span className="mono" aria-hidden="true">
                <Letters text="IA" start={0.38} />
              </span>
              <span className="nm" aria-hidden="true">
                <span className="f">
                  <Letters text="Ifadah" start={0.58} />
                </span>
                <span>
                  <Letters text="Aulia" start={1.08} />
                </span>
              </span>
            </h1>
            <div className="sub">
              <span>{t.sub}</span>
              <span>{t.subRight}</span>
            </div>
          </div>
          <a
            className="arrow"
            style={{ left: "70%", top: 330 }}
            href="#about"
            aria-label={t.scrollAria}
            onClick={(e) => goto(e, "#about")}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v15M5 12l7 7 7-7" />
            </svg>
          </a>
          <div className="vl" aria-hidden="true">
            {t.vl}
          </div>
          <div className="notes">
            {t.notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
          <a
            className="pill hx"
            href="#projects"
            onClick={(e) => goto(e, "#projects")}
          >
            {t.explore}
          </a>
        </section>

        {/* ABOUT */}
        <section className="about rv" id="about" tabIndex={-1}>
          <div className="eb">{t.aboutLabel}</div>

          <p className="st">
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

          <div className="meta">
            <div>
              {t.about.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>

            <div
            className="ab-focus"
            style={{ justifySelf: "end", display: "flex", justifyContent: "flex-end" }}
            >
              <CircularText
                text={`${t.tags.join(" • ").toUpperCase()} • `}
                size={220}
                fontSize={20}
                fontWeight={900}
                fill={false}
                letterSpacing={0.04}
                spinDuration={22}
                onHover="speedUp"
                hoverTilt={8}
                draggable
                color="var(--orange)"
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    color: "#fff",
                    opacity: 0.7,
                  }}
                >
                  {t.focusTitle}
                </span>
              </CircularText>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="work" id="projects" tabIndex={-1}>
          <div className="wt">
            <div className="sh2">
              <AnimatedText
                lines={[
                  { text: t.projectsH1 ?? "FEATURED" },
                  { text: t.projectsH2 ?? "PROJECTS.", className: "or" },
                ]}
              />
            </div>
          </div>
          {/* Project Dropdown Accordions */}
          <div className="pdrop-container">
            <div className="pdrop-top-bar">
              <span className="pdrop-summary">
                {t.projSummary?.(projectGroups.length, projects.length)}
              </span>
              <button
                type="button"
                className="pdrop-expand-btn"
                onClick={allOpen ? collapseAllGroups : expandAllGroups}
                aria-label={allOpen ? t.collapseAll : t.expandAll}
              >
                <span>{allOpen ? t.collapseAll : t.expandAll}</span>
                <span style={{ fontSize: 13, lineHeight: 1 }}>{allOpen ? "−" : "+"}</span>
              </button>
            </div>

            {projectGroups.map((group) => (
              <ProjectDropdown
                key={group.id}
                group={group}
                isOpen={Boolean(openGroups[group.id])}
                onToggle={() => toggleGroup(group.id)}
                onSelectProject={(originalIndex) => setProj(originalIndex)}
                openLabel={t.openCategory ?? "View"}
                closeLabel={t.closeCategory ?? "Close"}
                countText={t.projCount(group.items.length)}
                colProject={t.colProject}
                colDiscipline={t.colDiscipline}
                openAria={t.openAria}
                asset={asset}
              />
            ))}
          </div>
          <div className="wb">
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

        {/* SKILLS */}
        <section className="svc svc-skills" id="skills" tabIndex={-1}>
          <div className="skills-dither-bg" aria-hidden="true">
            <Dither
              waveSpeed={0.04}
              waveFrequency={2.2}
              waveAmplitude={0.32}
              palette={[
                "#000000",
                "#0e0300",
                "#1e0600",
                "#3a0c00",
                "#621600",
                "#962600",
                "#d14404",
              ]}
              pixelSize={3}
              ditherMode="bayer"
              scale={1.2}
              contrast={1.06}
              brightness={-0.10}
              mouseEffect="reveal"
              mouseRadius={0.65}
              mouseStrength={0.42}
              trail={0.35}
              clickRipple={true}
              intro={false}
            />
          </div>
          <div className="sh2">
            <AnimatedText
              lines={[
                { text: t.skillsH1 },
                { text: t.skillsH2, className: "or" },
              ]}
            />
          </div>
          {(() => {
            const skillCats = [
              {
                num: "01",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                ),
                title: ["WEB", "DEVELOPMENT"],
                orIdx: 0,
                desc: t.skWebDesc,
                tools: ["React", "TypeScript", "JavaScript", "Laravel", "PHP", "MySQL", "Tailwind CSS", "HTML & CSS", "Node.js", "Chart.js", "Vite"],
              },
              {
                num: "02",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                  </svg>
                ),
                title: ["DATA", "ANALYSIS"],
                orIdx: 0,
                desc: t.skDataDesc,
                tools: ["Microsoft Excel", "Microsoft Word", "Microsoft PowerPoint", "Chart.js", "Data Visualization", "Dashboard Design", "SQL / Database", "Spreadsheet"],
              },
              {
                num: "03",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                ),
                title: ["UI/UX", "DESIGN"],
                orIdx: 1,
                desc: t.skUiDesc,
                tools: ["Figma", "UI/UX Design", "Wireframing", "Prototyping", "User Research", "Design System", "Responsive Design"],
              },
            ];
            const singleSet = [...TECH_LOGOS, ...TECH_LOGOS];
            const marqueeLogos = [...singleSet, ...singleSet];
            return (
              <>
                <div className="sk-grid">
                  {skillCats.map((cat, i) => (
                    <div className="sk-col" key={i}>
                      <div className="sk-col-header">
                        <span className="sk-icon" aria-hidden="true">{cat.icon}</span>
                      </div>
                      <h3 className="sk-title">
                        {cat.title.map((line, li) => (
                          <span key={li} className={li === cat.orIdx ? "or" : ""}>{line}</span>
                        ))}
                      </h3>
                      <p className="sk-desc">{cat.desc}</p>
                      <div className="sk-group">
                        <div className="sk-label">{t.skTools}</div>
                        <div className="sk-tools-list">
                          {cat.tools.map((tool, ti) => (
                            <span key={ti} className="sk-tool-item">
                              {tool}
                              {ti < cat.tools.length - 1 && <span className="sk-sep">/</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="marquee-wrap" aria-hidden="true">
                  <div className="marquee-track">
                    {marqueeLogos.map((item, i) => (
                      <div
                        className="marquee-logo-item"
                        key={i}
                        title={item.name}
                        aria-label={item.name}
                      >
                        <TechLogo name={item.name} path={item.path} size={32} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </section>

        {/* CERTIFICATES */}
        <section className="svc cert" id="certificates" tabIndex={-1}>
          <div className="sh2">
            <AnimatedText lines={[{ text: t.certH1 }, { text: t.certH2, className: "or" }]} />
          </div>
          <div className="cert-stage">
            <FlexCarousel
              items={certItems}
              preset="liquid"
              intro="rise"
              cardHeight={0.5}
              gap={16}
              radius={6}
              fit="natural"
              captureWheel={false}
              cruise={32}
              onChange={setCertIdx}
              onFocusChange={setCertZoomed}
            />
          </div>
          <div className="cert-bar">
            <span className="cert-hint">{t.certHint}</span>
            <a
              className="pill"
              href={asset(CERTS[certIdx].pdf)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                opacity: certZoomed ? 1 : 0,
                pointerEvents: certZoomed ? "auto" : "none",
                transform: certZoomed ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              {t.certOpen}
            </a>
          </div>
          <ul className="sr">
            {CERTS.map((c) => (
              <li key={c.pdf}><a href={asset(c.pdf)}>{c.title}</a></li>
            ))}
          </ul>
        </section>

        {/* CONTACT */}
        <section className="ct" id="contact" tabIndex={-1}>
          <div className="eb">{t.contactLabel}</div>
          <h2 className="ct-title">
            <TechText
              lines={[
                { text: t.ctH1, color: "currentColor", boxColor: "#ff7a30" },
                { text: t.ctH2, color: "#ff7a30", boxColor: "currentColor" },
              ]}
              inset={0}
              style={{ marginTop: "-70px" }}
              fontSize={120}
              fontWeight={700}
              align="left"
              lineHeight={0.95}
              intro="assemble"
              introDuration={1.8}
              reach={140}
              softness={0.7}
              sweep={true}
              speed={0.8}
              selection={true}
              labels={false}
              draggable={true}
            />
          </h2>
          <div className="cg">
            {/* Left column: cat, description, CV */}
            <div className="contact-intro">
              <AnimatedCat />

              <div className="cc">
                <p>{t.ctText}</p>
                <p className="s">{t.ctServices}</p>

                <p style={{ marginTop: 30 }}>
                  <a
                    className="pill"
                    href={asset("images/CV-IFADAH.pdf")}
                    download="CV-Ifadah-Aulia.pdf"
                  >
                    {t.downloadCV}
                  </a>
                </p>
              </div>
            </div>

            {/* Right column: email and social links */}
            <div className="contact-links">
              <a className="em" href={`mailto:${PERSON.email}`}>
                {PERSON.email} ↗
              </a>

              <div className="so">
                {PERSON.socials.map(([n, u]) => (
                  <a key={n} href={u} target="_blank" rel="noopener noreferrer">
                    {n} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>

          <footer className="ft2">
            <div>
              <div>© Ifadah Aulia {new Date().getFullYear()}</div>
              <div className="ds">{t.footer}</div>
            </div>
            <a href="#top" onClick={(e) => goto(e, "#top")}>
              {t.backTop}
            </a>
          </footer>
        </section>
      </main>

      <dialog
        ref={dlg}
        aria-labelledby="cs-title"
        onClose={() => setProj(null)}
        onCancel={(e) => {
          e.preventDefault();
          closeProj();
        }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            closeProj();
        }}
      >
        {P && (
          <div className="cs">
            <div className="ctb">
              <span>
                {t.caseStudy} / {String(proj + 1).padStart(2, "0")}
              </span>
              <button
                className="cx"
                onClick={closeProj}
                aria-label={t.closeCase}
              >
                ×
              </button>
            </div>
            <h2 id="cs-title">{P.title}</h2>
            <p className="sm">{P.text}</p>
            <div className="art">
              <img src={asset(P.image)} alt={`${P.title} preview`} />
            </div>
            <dl className="cm">
              <div>
                <dt>{t.type}</dt>
                <dd>{P.kind}</dd>
              </div>
              <div>
                <dt>{t.focus}</dt>
                <dd>{P.cat}</dd>
              </div>
            </dl>
            <div className="cp">
              <h3>{t.techStack}</h3>
              <p>{P.tech.join(" / ")}</p>
            </div>
            <div className="cp">
              <h3>{t.highlights}</h3>
              <p>{P.tags.join(" / ")}</p>
            </div>
            {P.url && (
              <p style={{ marginTop: 22 }}>
                <a
                  className="pill"
                  href={P.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.openProject}
                </a>
              </p>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}