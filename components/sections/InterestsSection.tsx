import Image from "next/image";

export default function InterestsSection() {
  const interests = [
    { name: "Football", icon: "⚽️", desc: "Playing and watching the beautiful game." },
    { name: "GYM", icon: "🏋️‍♂️", desc: "Lifting weights, consistency, and discipline." },
    { name: "Swimming", icon: "🏊‍♂️", desc: "Staying active and clear-minded in the water." },
    { name: "Reading", icon: "📚", desc: "Diving into Self-Help books and Fiction." },
  ];

  return (
    <div className="space-y-8 font-mono">
      <p className="text-white/60 text-lg mb-8">What I love to do outside of engineering.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {interests.map(interest => (
          <div key={interest.name} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{interest.icon}</span>
              <h3 className="text-white font-bold text-lg">{interest.name}</h3>
            </div>
            <p className="text-white/60 text-sm">{interest.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-br from-[#49B3FC]/20 to-[#030712] border border-[#49B3FC]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl leading-none font-black pointer-events-none">🏏</div>
        
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <span>Cricket</span>
        </h3>
        <p className="text-[#49B3FC] font-bold mb-6">Runner-Up in University Hostel Cricket Tournament</p>
        
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(73,179,252,0.2)]">
          {/* Ensure the image path is correct relative to the public directory */}
          <Image 
            src="/cricket-award.jpg" 
            alt="VIT Hostel Day Cricket Award" 
            fill 
            className="object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    </div>
  );
}
