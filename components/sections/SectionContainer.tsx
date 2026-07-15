import { motion, AnimatePresence } from "framer-motion";
import AboutSection from "./AboutSection";
import SkillsSection from "./SkillsSection";
import ResumeSection from "./ResumeSection";
import ProjectsSection from "./ProjectsSection";
import ContactSection from "./ContactSection";
import GithubSection from "./GithubSection";
import InterestsSection from "./InterestsSection";

interface SectionContainerProps {
  activeBuildingId: string | null;
  onClose: () => void;
}

export default function SectionContainer({ activeBuildingId, onClose }: SectionContainerProps) {
  if (!activeBuildingId) return null;

  const renderContent = () => {
    switch (activeBuildingId) {
      case 'about': return <AboutSection />;
      case 'skills': return <SkillsSection />;
      case 'resume': return <ResumeSection />;
      case 'projects': 
      case 'ios': return <ProjectsSection />;
      case 'contact': return <ContactSection />;
      case 'github': return <GithubSection />;
      case 'interests': return <InterestsSection />;
      default: return (
        <div className="text-white/50 italic py-12 text-center">
          Building content is currently under construction.
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.5 }} // Fade in after the zoom finishes
        className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 pointer-events-auto"
      >
        <div className="absolute inset-0 bg-[#030712]/40" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8, type: "spring", damping: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto no-scrollbar bg-[#030712]/80 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-md"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#030712]/90 backdrop-blur-xl z-10 flex items-center justify-between mb-8 border-b border-white/10 pb-6 pt-2 -mt-4">
            <h2 className="text-3xl md:text-5xl font-mono font-bold text-white tracking-tight uppercase drop-shadow-[0_0_15px_rgba(73,179,252,0.5)]">
              {activeBuildingId.replace('-', ' ')}
            </h2>
            <button
              onClick={onClose}
              data-cursor-hover="true"
              className="text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
