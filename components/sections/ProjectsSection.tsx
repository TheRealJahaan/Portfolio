export default function ProjectsSection() {
  const projects = [
    {
      title: "Quote Generator iOS App",
      stack: "SwiftUI",
      desc: "A beautiful native iOS application built with SwiftUI that generates and displays inspiring quotes with elegant typography and animations."
    },
    {
      title: "User Authentication System",
      stack: "SwiftUI",
      desc: "A secure, robust user authentication flow for iOS applications, managing state, secure storage, and UI transitions smoothly."
    },
    {
      title: "Personal iOS Learning Projects",
      stack: "Swift / Xcode",
      desc: "Various experimental projects exploring App Architecture (MVVM), API Integrations, Firebase, and Core Data."
    }
  ];

  return (
    <div className="space-y-6 font-mono">
      <p className="text-white/60 mb-8">Selected works and experiments.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj, i) => (
          <div key={i} className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#49B3FC]/50 transition-all cursor-pointer">
            <div className="text-xs text-[#49B3FC] font-bold mb-2">{proj.stack}</div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#49B3FC] transition-colors">{proj.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{proj.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
