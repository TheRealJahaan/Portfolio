/*
 * ============================================================
 *  CONTENT FILE: everything personal lives here.
 *  Edit this file to change what the site says; you should
 *  never need to touch app.js for content changes.
 * ============================================================
 */
window.PORTFOLIO = {
  name: "Jahaan Suthar",
  role: "iOS Developer",
  tagline: "I build fast, native iOS apps with Swift and SwiftUI.",
  location: "India",
  // Path to a photo (e.g. "assets/me.jpg"). Leave empty to show a monogram avatar.
  photo: "",
  resume: "assets/resume.pdf",

  bio: [
    "Computer Science student at VIT Chennai and an iOS developer who builds performant, responsive native apps with Swift and SwiftUI.",
    "I lean on solid DSA and MVVM fundamentals and use AI-assisted workflows to ship faster. Give me a new framework on Monday and I'll have something real running on Tuesday."
  ],

  now: "Turning a spare Android phone into my own terminal and OS playground: Android internals, the Linux shell, ADB and Termux.",

  stats: [
    { value: "8.38", label: "CGPA at VIT" },
    { value: "3", label: "projects shipped in 2026" },
    { value: "24h", label: "to get productive in a new framework" }
  ],

  contact: {
    email: "jahaansuthar@gmail.com",
    github: "https://github.com/TheRealJahaan",
    linkedin: "https://www.linkedin.com/in/jahaan-suthar-648320320",
    // Used by the "Book a call" button. Swap in a Calendly / Cal.com link if you have one.
    bookCall: "mailto:jahaansuthar@gmail.com?subject=Let's%20work%20together&body=Hi%20Jahaan%2C%0A%0A"
  },

  /* ---------- The airports ----------
   * home is the About Me terminal; the other four are the destinations.
   * lat/lon place the pin on the world map. */
  cities: {
    home:      { id: "about",     city: "Chennai",       code: "MAA", section: "About Me",  flight: "HOM-001", gate: "H0", lat: 13.08, lon: 80.27,   tz: "Asia/Kolkata" },
    projects:  { id: "projects",  city: "San Francisco", code: "SFO", section: "Projects",  flight: "PRJ-101", gate: "A1", lat: 37.77, lon: -122.42, tz: "America/Los_Angeles" },
    skills:    { id: "skills",    city: "Tokyo",         code: "HND", section: "Skills",    flight: "SKL-202", gate: "B2", lat: 35.68, lon: 139.69,  tz: "Asia/Tokyo" },
    languages: { id: "languages", city: "London",        code: "LHR", section: "Languages", flight: "LNG-303", gate: "C3", lat: 51.5,  lon: -0.12,   tz: "Europe/London" },
    education: { id: "education", city: "Boston",        code: "BOS", section: "Education", flight: "EDU-404", gate: "D4", lat: 42.36, lon: -71.06,  tz: "America/New_York" }
  },

  /* ---------- PROJECTS city: postcards ---------- */
  projects: [
    {
      name: "Quote Generator",
      kind: "iOS app",
      year: "2026",
      summary: "A native SwiftUI app that serves up fresh quotes with a clean, responsive interface.",
      role: "Solo developer",
      tech: ["Swift", "SwiftUI", "SwiftData", "MVVM"],
      details: [
        "Dynamic quote generation with interactive presentation states and smooth navigation.",
        "User authentication and local persistence with SwiftData.",
        "MVVM keeps business logic fully separate from the UI layer."
      ],
      links: { code: "https://github.com/TheRealJahaan/Quote_Generator_IOS", live: "" },
      postcard: "harbour" // artwork style: harbour | campus | city
    },
    {
      name: "CampusConnect",
      kind: "Web app",
      year: "2026",
      summary: "A campus networking and utility web app that helps university students find each other and collaborate.",
      role: "Designer and developer",
      tech: ["JavaScript", "HTML", "CSS"],
      details: [
        "Highly interactive front end with fluid layouts and real-time updates.",
        "Client-side navigation structured so students find resources quickly."
      ],
      links: { code: "", live: "" },
      postcard: "campus"
    },
    {
      name: "bizflow",
      kind: "Productivity tool",
      year: "2026",
      summary: "A business productivity tool that tracks workflows and visualises project metrics.",
      role: "Developer",
      tech: ["Workflow engine", "Data pipelines", "Dashboards"],
      details: [
        "Workflow visualisation and tracking engine built to scale.",
        "Data pipelines that parse project metrics and handle concurrent process states."
      ],
      links: { code: "", live: "" },
      postcard: "city"
    }
  ],

  /* ---------- SKILLS city: passport stamps ----------
   * level: 1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Expert */
  skills: [
    { group: "Frontend", note: "iOS & web interfaces", items: [
      { name: "SwiftUI", level: 3 }, { name: "UIKit", level: 2 },
      { name: "HTML & CSS", level: 2 }, { name: "Responsive UI", level: 3 }
    ]},
    { group: "Backend", note: "Logic & architecture", items: [
      { name: "MVVM", level: 3 }, { name: "REST APIs", level: 2 },
      { name: "Python", level: 2 }, { name: "DSA", level: 2 }
    ]},
    { group: "Database", note: "Persistence & data", items: [
      { name: "SwiftData", level: 2 }, { name: "Local persistence", level: 2 },
      { name: "Data pipelines", level: 1 }
    ]},
    { group: "Tools", note: "Daily kit", items: [
      { name: "Xcode", level: 3 }, { name: "Git & GitHub", level: 3 },
      { name: "Android Studio", level: 1 }, { name: "ADB & Termux", level: 1 }
    ]},
    { group: "AI", note: "Ship faster", items: [
      { name: "Prompt engineering", level: 3 }, { name: "LLM apps", level: 2 },
      { name: "GitHub Copilot", level: 3 }, { name: "ChatGPT", level: 3 }
    ]}
  ],

  /* ---------- LANGUAGES city ----------
   * rate is 0-100 and drives the bar on the exchange board. */
  codeLanguages: [
    { code: "SWF", name: "Swift",      level: "Advanced",     rate: 82 },
    { code: "PY",  name: "Python",     level: "Intermediate", rate: 64 },
    { code: "JS",  name: "JavaScript", level: "Intermediate", rate: 58 },
    { code: "WEB", name: "HTML / CSS", level: "Intermediate", rate: 62 }
  ],
  spokenLanguages: [
    { name: "English",  level: "Fluent", origin: "Global" },
    { name: "Hindi",    level: "Fluent", origin: "India" },
    { name: "Gujarati", level: "Native", origin: "Gujarat" }
  ],

  /* ---------- EDUCATION city: flight log ---------- */
  education: [
    {
      type: "Education",
      title: "B.Tech in Computer Science & Engineering (Core)",
      org: "Vellore Institute of Technology (VIT), Chennai",
      from: "2024", to: "2028",
      status: "In flight",
      highlights: ["CGPA 8.38 / 10", "Core CSE: data structures, algorithms, systems"]
    },
    {
      type: "Connecting flight",
      title: "Software Development Intern",
      org: "Wipro × InspireLeap",
      from: "May 2026", to: "Present",
      status: "In flight",
      highlights: [
        "Clean, high-performance Python for assignments and production software concepts.",
        "Algorithmic problem solving to optimise core data structures.",
        "Built and deployed modular, practical applications."
      ]
    },
    {
      type: "Achievement",
      title: "Runner-Up, University Hostel Cricket Tournament",
      org: "VIT Chennai Hostel Day",
      from: "2026", to: "",
      status: "Landed",
      highlights: ["Off the keyboard: football, gym, swimming and reading too."],
      photo: "assets/cricket-award.jpg"
    }
  ]
};
