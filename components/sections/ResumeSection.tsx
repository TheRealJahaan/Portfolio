export default function ResumeSection() {
  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <span className="text-4xl">👨‍💻</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Jahaan Suthar</h3>
          <p className="text-[#94A3B8] mb-4">Software Engineer</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <span className="text-[#49B3FC]">Age:</span> 19
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#49B3FC]">Location:</span> Chennai, India
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Education</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#49B3FC]" />
          <h4 className="text-lg font-bold text-white">VIT Chennai</h4>
          <p className="text-[#49B3FC] text-sm mt-1 mb-3">Current Year: 3rd Year</p>
          <p className="text-white/80 text-sm leading-relaxed">
            B.Tech in Computer Science and Engineering (Core)
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Languages</h3>
        <div className="flex gap-4">
          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">English</span>
          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">Hindi</span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Full Resume</h3>
        <a 
          href="#" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#49B3FC] text-black font-bold rounded-lg hover:bg-[#3ba0e5] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download PDF
        </a>
      </div>
    </div>
  );
}
