export default function ContactSection() {
  const links = [
    { name: "GitHub", url: "https://github.com/TheRealJahaan", icon: "🐈‍⬛" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/jahaan-suthar-648320320", icon: "💼" },
    { name: "Instagram", url: "https://www.instagram.com/suthar_jahaan", icon: "📸" },
  ];

  return (
    <div className="space-y-8 font-mono">
      <p className="text-white/60">
        Let's build something incredible together. Reach out via any of the platforms below.
      </p>

      <div className="grid gap-4">
        {links.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover="true"
            className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#49B3FC]/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{link.icon}</span>
              <span className="text-white font-bold text-lg">{link.name}</span>
            </div>
            <svg 
              className="text-white/30 group-hover:text-[#49B3FC] transition-colors"
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </a>
        ))}
      </div>

      <div className="mt-12 p-8 bg-[#49B3FC]/5 border border-[#49B3FC]/20 rounded-2xl text-center">
        <h3 className="text-white font-bold mb-2">Direct Email</h3>
        <p className="text-[#49B3FC] text-xl font-bold">jahaansuthar@example.com</p>
      </div>
    </div>
  );
}
