"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronLeft } from "lucide-react";
import { sendBriefing } from "@/app/actions";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";

const STEPS = [
  {
    id: "scope",
    question: "EXEC scale_params",
    options: ["E-commerce Headless", "Boutique Editorial", "SaaS / Web App", "Optimización Core Web Vitals"]
  },
  {
    id: "budget",
    question: "CONFIG investment_range (CLP)",
    options: ["1.5M - 2.5M", "2.5M - 5M", "5M+", "Consultoría Mensual"]
  }
];

const TerminalPrompt = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 mb-8">
    <span className="text-emerald-500 font-mono text-sm leading-none shrink-0">&gt;_</span>
    <h3 className="text-xl md:text-2xl tracking-tight font-mono text-emerald-400 leading-none uppercase">
      {text}
    </h3>
  </div>
);

const BlinkingCursor = () => (
  <motion.span
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.501] }}
    className="inline-block w-2.5 h-5 bg-emerald-500 ml-1 translate-y-1"
  />
);

export const BriefingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => currentStep > 0 && currentStep <= STEPS.length && setCurrentStep(currentStep - 1);

  const triggerNebulaFocus = (focus: boolean) => {
    setIsFocused(focus);
    window.dispatchEvent(new CustomEvent("nebula-focus", { detail: { focus } }));
  };

  const clientAction = async (data: FormData): Promise<void> => {
    setIsSubmitting(true);
    const result = await sendBriefing(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setCurrentStep(STEPS.length + 1);
    } else {
      alert("Error sending briefing. Please try again.");
    }
  };

  return (
    <section id="contact" className="py-32 px-8 max-w-4xl mx-auto relative z-10 transition-all duration-1000">
      <div className="mb-16 border-l border-emerald-500/20 pl-8">
        <RecursiveReveal>
          <span className="text-emerald-500/40 font-mono text-[10px] uppercase tracking-[0.4em]">
            {currentStep > STEPS.length ? "Status: 200 OK" : `SYS.INPUT [STEP_0${currentStep + 1}_OF_03]`}
          </span>
        </RecursiveReveal>
        <RecursiveReveal delay={0.1}>
          <h2 className="text-3xl font-mono tracking-tighter mt-2 text-white uppercase">
            Engineering Briefing <BlinkingCursor />
          </h2>
        </RecursiveReveal>
      </div>

      <form 
        action={clientAction} 
        onFocus={() => triggerNebulaFocus(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            triggerNebulaFocus(false);
          }
        }}
        className={`bg-emerald-950/5 border p-8 md:p-12 min-h-[450px] flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group shadow-[0_0_100px_rgba(16,185,129,0.01)] transition-all duration-500 ${
          isFocused ? "border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.1)]" : "border-emerald-900/20"
        }`}
      >
        {/* Holographic grid effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Signal Noise Overlay (Only when focused) */}
        {isFocused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"
          />
        )}

        <input type="hidden" name="scope" value={formData.scope || ""} />
        <input type="hidden" name="budget" value={formData.budget || ""} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {currentStep > STEPS.length ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[250px]">
                <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center mb-6">
                  <div className="w-2 h-2 bg-emerald-500 animate-ping" />
                </div>
                <h3 className="text-2xl font-mono text-emerald-400 mb-4 uppercase">Transmission Success</h3>
                <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest leading-relaxed">
                  Your briefing has been encrypted and sent. Our engineering team will review the specifications and establish contact.
                </p>
              </div>
            ) : (
              <>
                <TerminalPrompt text={STEPS[currentStep]?.question || "CONFIG client_params"} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px mt-12 bg-emerald-900/10 border border-emerald-900/20">
                  {currentStep < STEPS.length && STEPS[currentStep].options.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelect(STEPS[currentStep].id, opt)}
                      className={`text-left p-6 transition-all group relative bg-black/40 hover:bg-emerald-500/5 ${
                        formData[STEPS[currentStep].id] === opt 
                          ? "ring-1 ring-inset ring-emerald-500/50 bg-emerald-500/10" 
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                            formData[STEPS[currentStep].id] === opt ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-zinc-800"
                         }`} />
                         <span className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${
                           formData[STEPS[currentStep].id] === opt ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/60"
                         }`}>
                           {opt}
                         </span>
                      </div>
                    </button>
                  ))}

                  {currentStep === STEPS.length && (
                    <div className="col-span-2 space-y-1 bg-black/40 p-1">
                      <div className="flex items-start gap-4 p-4 border-b border-emerald-900/10">
                        <span className="text-emerald-500 font-mono text-xs mt-3">&gt;</span>
                        <input 
                          required 
                          name="name" 
                          type="text" 
                          placeholder="IDENT_ID / FULL_NAME" 
                          className="w-full bg-transparent py-3 outline-none focus:text-emerald-400 transition-colors font-mono text-xs text-zinc-400 placeholder:text-zinc-800 uppercase" 
                        />
                      </div>
                      <div className="flex items-start gap-4 p-4 border-b border-emerald-900/10">
                        <span className="text-emerald-500 font-mono text-xs mt-3">&gt;</span>
                        <input 
                          required 
                          name="email" 
                          type="email" 
                          placeholder="SECURE_COMMS / EMAIL" 
                          className="w-full bg-transparent py-3 outline-none focus:text-emerald-400 transition-colors font-mono text-xs text-zinc-400 placeholder:text-zinc-800 uppercase" 
                        />
                      </div>
                      <div className="flex items-start gap-4 p-4">
                        <span className="text-emerald-500 font-mono text-xs mt-3">&gt;</span>
                        <textarea 
                          required 
                          name="message" 
                          placeholder="DATA_PAYLOAD / PROJECT_DETAILS" 
                          className="w-full bg-transparent py-3 outline-none focus:text-emerald-400 transition-colors font-mono text-xs h-32 resize-none text-zinc-400 placeholder:text-zinc-800 uppercase" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center border-t border-emerald-900/20 pt-8 relative z-10">
          <button 
            type="button"
            onClick={prevStep} 
            disabled={currentStep === 0 || currentStep > STEPS.length}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 hover:text-emerald-500 disabled:opacity-0 transition-all cursor-pointer"
          >
            <ChevronLeft size={14} /> Back
          </button>
          
          {currentStep === STEPS.length ? (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-8 py-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-emerald-500 hover:text-black transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "ENCRYPTING..." : "EXEC DEPLOY_BRIEFING"} <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          ) : currentStep < STEPS.length ? (
             <div className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest animate-pulse">
                Awaiting selective input...
             </div>
          ) : (
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Secure Connection Established
            </div>
          )}
        </div>
      </form>
    </section>
  );
};
