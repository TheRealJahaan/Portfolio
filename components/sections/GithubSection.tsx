"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GithubData {
  login: string;
  avatar_url: string;
  name: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  bio: string;
}

export default function GithubSection() {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.github.com/users/TheRealJahaan")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-[#49B3FC]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#49B3FC]/30 border-t-[#49B3FC] rounded-full mb-6"
        />
        <p className="animate-pulse">Decrypting GitHub Node...</p>
      </div>
    );
  }

  if (!data || !data.login) {
    return <div className="text-red-400 font-mono">Failed to connect to GitHub mainframe.</div>;
  }

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-8 bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-[0_0_40px_rgba(73,179,252,0.1)] relative overflow-hidden group">
        
        {/* Animated Cyber Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#49B3FC 1px, transparent 1px), linear-gradient(90deg, #49B3FC 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: 'center center'
        }}>
          <motion.div 
            className="w-full h-full bg-gradient-to-b from-transparent via-[#49B3FC] to-transparent opacity-30"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#49B3FC] shadow-[0_0_20px_rgba(73,179,252,0.5)]">
            <img src={data.avatar_url} alt={data.login} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse border-2 border-black">
            ONLINE
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <h3 className="text-3xl font-bold text-white mb-1">{data.name || data.login}</h3>
          <a href={`https://github.com/${data.login}`} target="_blank" rel="noreferrer" className="text-[#49B3FC] hover:underline mb-4 inline-block">
            @{data.login}
          </a>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto md:mx-0">
            {data.bio || "No bio provided. Code speaks louder than words."}
          </p>

          <div className="grid grid-cols-3 gap-4 text-center md:text-left">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-2xl font-bold text-white">{data.public_repos}</div>
              <div className="text-xs text-[#49B3FC] uppercase tracking-wider">Repos</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-2xl font-bold text-white">{data.followers}</div>
              <div className="text-xs text-[#49B3FC] uppercase tracking-wider">Followers</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-2xl font-bold text-white">{data.following}</div>
              <div className="text-xs text-[#49B3FC] uppercase tracking-wider">Following</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-[#49B3FC] font-bold mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Neural Link
        </h4>
        <div className="space-y-3 font-mono text-xs md:text-sm">
          <div className="flex items-center justify-between text-white/60">
            <span>{`>`} Initiating handshake with GitHub API...</span>
            <span className="text-green-400">SUCCESS</span>
          </div>
          <div className="flex items-center justify-between text-white/60">
            <span>{`>`} Decrypting repository metrics...</span>
            <span className="text-green-400">SUCCESS</span>
          </div>
          <div className="flex items-center justify-between text-white/60">
            <span>{`>`} Compiling contribution terrain...</span>
            <span className="text-yellow-400 animate-pulse">PROCESSING</span>
          </div>
        </div>
      </div>
      
      <a 
        href={`https://github.com/${data.login}`} 
        target="_blank" 
        rel="noreferrer"
        className="block w-full py-4 bg-[#49B3FC]/10 hover:bg-[#49B3FC]/20 border border-[#49B3FC]/50 text-center rounded-xl text-[#49B3FC] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(73,179,252,0.2)]"
      >
        Access Mainframe
      </a>
    </div>
  );
}
