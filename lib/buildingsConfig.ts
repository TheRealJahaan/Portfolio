export type BuildingId =
  | "about"
  | "skills"
  | "ios"
  | "projects"
  | "github"
  | "blog"
  | "contact"
  | "resume";

export interface BuildingConfig {
  id: BuildingId;
  label: string;
  colorToken: string;
  heightPx: number;
  windowCols: number;
  windowRows: number;
  description: string;
}

export const buildingsConfig: BuildingConfig[] = [
  {
    id: "about",
    label: "About",
    colorToken: "building-about",
    heightPx: 300,
    windowCols: 4,
    windowRows: 8,
    description: "Who I am and what I do.",
  },
  {
    id: "skills",
    label: "Skills",
    colorToken: "building-skills",
    heightPx: 350,
    windowCols: 5,
    windowRows: 10,
    description: "My technical stack and proficiency.",
  },
  {
    id: "ios",
    label: "iOS Apps",
    colorToken: "building-ios",
    heightPx: 500, // Tallest to represent complex native mobile work
    windowCols: 6,
    windowRows: 15,
    description: "Native iOS applications I've built.",
  },
  {
    id: "projects",
    label: "Projects",
    colorToken: "building-projects",
    heightPx: 450, // Second tallest for major web projects
    windowCols: 6,
    windowRows: 12,
    description: "Featured web and software projects.",
  },
  {
    id: "github",
    label: "GitHub",
    colorToken: "building-github",
    heightPx: 250, // Short to fit the contribution graph proportions nicely
    windowCols: 53, // 53 weeks
    windowRows: 7, // 7 days
    description: "Live open source contributions.",
  },
  {
    id: "interests",
    label: "Interests",
    colorToken: "building-blog",
    heightPx: 320,
    windowCols: 4,
    windowRows: 9,
    description: "What I love to do.",
  },
  {
    id: "contact",
    label: "Contact",
    colorToken: "building-contact",
    heightPx: 280,
    windowCols: 8,
    windowRows: 7,
    description: "Get in touch for work or collaboration.",
  },
  {
    id: "resume",
    label: "Resume",
    colorToken: "building-resume",
    heightPx: 380,
    windowCols: 5,
    windowRows: 11,
    description: "My professional experience and history.",
  },
];
