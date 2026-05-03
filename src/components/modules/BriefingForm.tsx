"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronLeft, AlertCircle } from "lucide-react";
import { sendBriefing } from "@/app/actions";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";
import { GlitchTitle } from "@/components/ui/GlitchTitle";
import { BreathingContainer } from "@/components/ui/BreathingContainer";

const STEPS = [
  {
    id: "scope",
    question: "EXEC scale_params",
    options: ["[ Shopify / Next.js ]", "[ WordPress / Next.js ]", "[ SaaS / Custom App ]", "[ Consulting / Performance Audit ]"]
  },
  {
    id: "priority",
    question: "CONFIG priority_set",
    options: ["Performance (LCP)", "SEO / Authority", "Design Fidelity"]
  }
];

const TerminalPrompt = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="text-emerald-500 font-mono text-base leading-none shrink-0 animate-pulse">&gt;_</span>
    <h3 className="text-lg md:text-xl tracking-wider font-mono text-emerald-400 leading-none uppercase">
      {text}
    </h3>
  </div>
);

const BlinkingCursor = () => (
  <motion.span
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.501] }}
    className="inline-block w-2.5 h-6 bg-emerald-500 ml-2 translate-y-1"
  />
);

const ProgressBar = ({ current, total }: { current: number, total: number }) => {
  const progress = Math.min((current / total) * 10, 10);
  const bars = "■".repeat(progress) + "□".repeat(10 - progress);
  return (
    <div className="font-mono text-[10px] md:text-[12px] text-emerald-500/40 tracking-[0.2em] md:tracking-[0.3em] font-medium">
      STATUS: [{bars}] STEP_0{Math.min(current + 1, total)}/0{total}
    </div>
  );
};

import { WiredTerminal } from "@/components/ui/WiredTerminal";

export const BriefingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSelect = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setError(null);
    setTimeout(() => setCurrentStep(prev => prev + 1), 200);
  };

  const prevStep = () => {
    setError(null);
    currentStep > 0 && currentStep <= STEPS.length && setCurrentStep(currentStep - 1);
  };

  const triggerNebulaFocus = (focus: boolean) => {
    setIsFocused(focus);
    window.dispatchEvent(new CustomEvent("nebula-focus", { detail: { focus } }));
  };

  const validateFinalStep = () => {
    const data = new FormData(formRef.current!);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const message = data.get("message") as string;

    if (!name || name.trim().length < 2) return "ERROR: IDENT_ID_REQUIRED";
    if (!email || !email.includes("@")) return "ERROR: INVALID_COMMS_CHANNEL";
    if (!message || message.trim().length < 10) return "ERROR: DATA_PAYLOAD_TOO_SMALL";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateFinalStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const data = new FormData(formRef.current!);
    const result = await sendBriefing(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setCurrentStep(STEPS.length + 1);
    } else {
      setError("ERROR: UPLINK_FAILED_RETRY");
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 px-4 md:px-8 max-w-5xl mx-auto relative z-10 transition-all duration-1000">
      {/* The Wired - Final Deep Layers (Unstable) */}
      <div className="absolute left-2 md:left-4 top-4 z-0 opacity-40">
        <WiredTerminal 
          text="Layer 11: Infornography"
          delay={0.5}
          speed={60}
          unstable={true}
          className="text-emerald-500/10 text-[9px] md:text-[10px] uppercase tracking-widest"
        />
      </div>
      <div className="absolute right-2 md:right-4 bottom-4 z-0">
        <WiredTerminal 
          text="Layer 12: Landscape"
          delay={1.2}
          speed={60}
          unstable={true}
          className="text-emerald-500/5 text-[9px] md:text-[10px] uppercase tracking-widest"
        />
      </div>
      <div className="absolute right-4 md:right-8 bottom-8 z-0">
        <WiredTerminal 
          text="Layer 13: Ego"
          delay={2}
          speed={100}
          unstable={true}
          className="text-white/10 text-[10px] md:text-xs italic tracking-[0.4em] md:tracking-[0.8em]"
        />
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
      
      <div className="mb-10 md:mb-14 border-l-2 border-emerald-500/30 pl-6 md:pl-10 space-y-4 md:space-y-6">
        <RecursiveReveal>
          <ProgressBar current={currentStep} total={STEPS.length + 1} />
        </RecursiveReveal>
        <RecursiveReveal delay={0.1}>
          <GlitchTitle
            text="Engineering Briefing"
            as="h2"
            delay="0.6s"
            duration="2s"
            className="text-3xl md:text-5xl font-mono tracking-tighter text-white uppercase"
          >
            Engineering Briefing <BlinkingCursor />
          </GlitchTitle>
        </RecursiveReveal>
      </div>

      <BreathingContainer isFocused={isFocused} className="relative shadow-2xl">
        <form 
          ref={formRef}
          onSubmit={handleSubmit}
          onFocus={() => triggerNebulaFocus(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              triggerNebulaFocus(false);
            }
          }}
          className="min-h-[500px] md:h-[820px] flex flex-col backdrop-blur-3xl relative overflow-hidden group transition-all duration-700 border border-emerald-500/20 bg-black/60"
        >
          {/* Holographic grid effect */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Signal Noise Overlay */}
          {isFocused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"
            />
          )}

          <input type="hidden" name="scope" value={formData.scope || ""} />
          <input type="hidden" name="priority" value={formData.priority || ""} />

          {/* INTERNAL CONTENT (SCROLLABLE AREA - NO VISIBLE BAR) */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 p-6 md:p-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="w-full h-full flex flex-col"
              >
                {currentStep > STEPS.length ? (
                  <div className="flex flex-col items-center justify-center text-center flex-1 py-10">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                    >
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full animate-ping" />
                    </motion.div>
                    <h3 className="text-xl md:text-3xl font-mono text-emerald-400 mb-6 uppercase tracking-[0.2em] font-bold">// TRANSMISIÓN_COMPLETA</h3>
                    <p className="text-zinc-400 font-mono uppercase text-xs md:text-sm tracking-[0.1em] leading-relaxed max-w-lg">
                      Briefing recibido y encriptado con éxito. <br />
                      Analizando viabilidad técnica en nuestros laboratorios. Estableceremos contacto en breve.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full">
                    <div className="mb-8 md:mb-12 border-l border-emerald-500/10 pl-6 py-2">
                      <p className="text-emerald-500/60 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] mb-2 font-bold select-none">
                        {currentStep === 0 ? "// STAGE_01: SCOPE_DEFINITION" : "// STAGE_02: PRIORITY_CONFIG"}
                      </p>
                      <p className="text-zinc-500 font-mono text-[11px] md:text-[12px] uppercase tracking-wider leading-relaxed max-w-xl">
                        {currentStep === 0 
                          ? "Iniciando protocolo de ingeniería. Seleccione el motor y arquitectura de despliegue." 
                          : "Configure los parámetros de prioridad para optimizar la carga."
                        }
                      </p>
                    </div>

                    <TerminalPrompt text={STEPS[currentStep]?.question ? `SELECT_${STEPS[currentStep].id.toUpperCase()}` : "UPLINK_DATA_CHANNEL"} />

                    {currentStep < STEPS.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {STEPS[currentStep].options.map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => handleSelect(STEPS[currentStep].id, opt)}
                            className={`text-left p-6 md:p-8 transition-all relative overflow-hidden border group ${
                              formData[STEPS[currentStep].id] === opt 
                                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40" 
                                : "border-emerald-950 bg-black/40 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                            }`}
                          >
                            <div className="flex items-center gap-4 relative z-10">
                               {formData[STEPS[currentStep].id] === opt ? (
                                 <motion.div 
                                   animate={{ 
                                     scale: [1, 1.25, 1],
                                     opacity: [0.7, 1, 0.7],
                                     boxShadow: [
                                       "0 0 10px rgba(16,185,129,0.2)",
                                       "0 0 25px rgba(16,185,129,0.6)",
                                       "0 0 10px rgba(16,185,129,0.2)"
                                     ]
                                   }}
                                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                   className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
                                 />
                               ) : (
                                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                               )}
                               <span className={`text-[11px] md:text-[12px] font-mono tracking-widest transition-colors uppercase ${
                                 formData[STEPS[currentStep].id] === opt ? "text-emerald-400 font-bold" : "text-zinc-500 group-hover:text-emerald-400/70"
                               }`}>
                                 {opt}
                               </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6 mt-4 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-emerald-500 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] px-1">SYS.INPUT(IDENT_ID):</label>
                            <input 
                              required 
                              name="name" 
                              type="text" 
                              placeholder="FULL_NAME / IDENTITY" 
                              className="w-full bg-black/60 border-b border-emerald-900/40 py-4 px-6 outline-none focus:border-emerald-500 focus:bg-emerald-500/5 focus:text-white transition-all font-mono text-xs md:text-sm text-zinc-300 placeholder:text-zinc-800 uppercase" 
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-emerald-500 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] px-1">SYS.INPUT(CHANNEL):</label>
                            <input 
                              required 
                              name="email" 
                              type="email" 
                              placeholder="EMAIL_ADDRESS" 
                              className="w-full bg-black/60 border-b border-emerald-900/40 py-4 px-6 outline-none focus:border-emerald-500 focus:bg-emerald-500/5 focus:text-white transition-all font-mono text-xs md:text-sm text-zinc-300 placeholder:text-zinc-800 uppercase" 
                            />
                          </div>
                        </div>
                        <div className="space-y-3 flex-1 flex flex-col">
                          <label className="text-emerald-500 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] px-1">SYS.INPUT(DATA_PAYLOAD):</label>
                          <textarea 
                            required 
                            name="message" 
                            placeholder={
                              formData.scope === "[ Consulting / Performance Audit ]"
                                ? "IDENTIFY BOTTLENECKS..."
                                : "SPECIFY GOALS..."
                            }
                            className="w-full bg-black/60 border border-emerald-900/40 py-4 px-6 outline-none focus:border-emerald-500 focus:bg-emerald-500/5 focus:text-white transition-all font-mono text-xs md:text-sm flex-1 min-h-[150px] md:min-h-[180px] resize-none text-zinc-300 placeholder:text-zinc-800 uppercase leading-relaxed" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FIXED FOOTER CONTROLS - OPTIMIZED FOR TOUCH ACCESSIBILITY */}
          <div className="bg-emerald-950/20 backdrop-blur-xl border-t border-emerald-500/10 px-6 md:px-14 py-8 md:py-10 flex flex-col gap-4 relative z-20">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-2 text-rose-500 font-mono text-[10px] md:text-[11px] uppercase tracking-wider mb-2"
              >
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
            
            <div className="flex justify-between items-center w-full min-h-[44px]">
              <button 
                type="button"
                onClick={prevStep} 
                disabled={currentStep === 0 || currentStep > STEPS.length}
                className="group flex items-center justify-center gap-3 text-[11px] md:text-[12px] font-mono uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-500 hover:text-emerald-400 disabled:opacity-0 transition-all cursor-pointer min-h-[44px] min-w-[100px]"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> {currentStep >= STEPS.length ? "[ ATRÁS ]" : "[ RETRO ]"}
              </button>
              
              {currentStep === STEPS.length ? (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group flex items-center justify-center gap-4 bg-emerald-500 text-black px-8 md:px-12 py-4 md:py-5 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold hover:bg-white hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? "TRANSMIT..." : "[ ENVIAR ]"} <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              ) : currentStep < STEPS.length ? (
              <div className="relative overflow-hidden group">
                <motion.div 
                  animate={{ 
                    opacity: [1, 0.8, 1, 0.4, 1],
                  }}
                  transition={{ 
                    duration: 0.2, 
                    repeat: Infinity, 
                    repeatDelay: 3 + Math.random() * 5,
                  }}
                  className="text-[9px] md:text-[11px] font-mono uppercase tracking-[0.2em] md:tracking-[0.4em] italic relative z-10"
                >
                   // BUS_WAIT_INPUT
                </motion.div>
              </div>
              ) : (
                <div className="text-[11px] md:text-[12px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-4 px-6 md:py-4 border border-emerald-500/30 bg-emerald-500/5 min-h-[44px]">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]" /> UPLINK_OK
                </div>
              )}
            </div>
          </div>
        </form>
      </BreathingContainer>
    </section>
  );
};
