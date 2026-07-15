export default function SkillsSection() {
  const skills = [
    "Swift", "SwiftUI", "Xcode", "iOS App Development",
    "Git & GitHub", "Object-Oriented Programming (OOP)",
    "Data Structures & Algorithms", "Problem Solving",
    "C++", "Java", "Python", "Basic UI/UX Design",
    "Team Collaboration", "Quick Learner"
  ];

  const learning = [
    "Advanced iOS Development", "App Architecture (MVVM)",
    "API Integration", "Firebase", "Core Data"
  ];

  return (
    <div className="space-y-12 text-white/80 font-mono">
      <div>
        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Technical Arsenal</h3>
        <div className="flex flex-wrap gap-3">
          {skills.map(skill => (
            <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 hover:border-[#49B3FC]/50 transition-colors cursor-default">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Currently Learning</h3>
        <div className="flex flex-wrap gap-3">
          {learning.map(topic => (
            <span key={topic} className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-400 hover:bg-green-500/20 transition-colors cursor-default">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 bg-[#49B3FC]/10 border border-[#49B3FC]/30 rounded-xl flex items-center gap-4">
        <span className="text-3xl">⚡</span>
        <p className="text-sm">
          <strong className="text-[#49B3FC]">Superpower:</strong> Ability to learn new technologies rapidly. Can learn new skills within 24 hours when required.
        </p>
      </div>
    </div>
  );
}
