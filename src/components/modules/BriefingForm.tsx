"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronLeft } from "lucide-react";
import { sendBriefing } from "@/app/actions";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";
import { GlitchTitle } from "@/components/ui/GlitchTitle";
import { BreathingContainer } from "@/components/ui/BreathingContainer";

const STEPS = [
  {
    id: "scope",
    question: "EXEC scale_params",
    options: ["[ Shopify / Next.js ]", "[ WordPress / Next.js ]", "[ SaaS / Custom App ]"]
  },
  {
    id: "priority",
    question: "CONFIG priority_set",
    options: ["Performance (LCP)", "SEO / Authority", "Design Fidelity"]
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

const ProgressBar = ({ current, total }: { current: number, total: number }) => {
  const progress = Math.min((current / total) * 10, 10);
  const bars = "■".repeat(progress) + "□".repeat(10 - progress);
  return (
    <div className="font-mono text-[10px] text-emerald-500/60 tracking-wider">
      STATUS: [{bars}] STEP_0{Math.min(current + 1, total)}/0{total}
    </div>
  );
};

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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="mb-16 border-l border-emerald-500/20 pl-8 space-y-4">
        <RecursiveReveal>
          <ProgressBar current={currentStep} total={STEPS.length + 1} />
        </RecursiveReveal>
        <RecursiveReveal delay={0.1}>
          <GlitchTitle
            text="Engineering Briefing"
            as="h2"
            delay="0.6s"
            duration="2s"
            className="text-3xl font-mono tracking-tighter text-white uppercase"
          >
            Engineering Briefing <BlinkingCursor />
          </GlitchTitle>
        </RecursiveReveal>
      </div>

      <BreathingContainer isFocused={isFocused} className="relative">
        <form 
          action={clientAction} 
          onFocus={() => triggerNebulaFocus(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              triggerNebulaFocus(false);
            }
          }}
          className="p-8 md:p-12 h-[580px] flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group transition-all duration-500 border border-emerald-900/10"
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
          <input type="hidden" name="priority" value={formData.priority || ""} />

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
                <div className="flex flex-col items-center justify-center p-12 text-center h-[350px]">
                  <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center mb-6">
                    <div className="w-2 h-2 bg-emerald-500 animate-ping" />
                  </div>
                  <h3 className="text-2xl font-mono text-emerald-400 mb-4 uppercase tracking-tighter">// TRANSMISIÓN_COMPLETA</h3>
                  <p className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest leading-relaxed max-w-md">
                    Briefing recibido con éxito. <br />
                    Analizando viabilidad técnica. Nos pondremos en contacto en breve.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-10 opacity-50">
                    <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-1">// INICIAR_COMUNICACIÓN</p>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      Esperando especificaciones técnicas para despliegue de alto rendimiento. <br />
                      Por favor, defina los parámetros de su proyecto a continuación.
                    </p>
                  </div>

                  <TerminalPrompt text={STEPS[currentStep]?.question ? `SELECT_${STEPS[currentStep].id.toUpperCase()}` : "CONFIG_PARAMS"} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px mt-12 bg-emerald-900/10 border border-emerald-900/20">
                    {currentStep < STEPS.length && STEPS[currentStep].options.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSelect(STEPS[currentStep].id, opt)}
                        className={`text-left p-6 transition-all group relative bg-black/40 border-l-2 ${
                          formData[STEPS[currentStep].id] === opt 
                            ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                            : "border-emerald-900/20 hover:border-emerald-500/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <span className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${
                             formData[STEPS[currentStep].id] === opt ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/60"
                           }`}>
                             [ {opt} ]
                           </span>
                        </div>
                      </button>
                    ))}

                    {currentStep === STEPS.length && (
                      <div className="col-span-2 space-y-4 bg-black/20 p-4 border border-emerald-900/5">
                        <div className="flex flex-col gap-2">
                          <span className="text-emerald-500/50 font-mono text-[9px] uppercase tracking-widest">SYS.INPUT(NAME):_</span>
                          <input 
                            required 
                            name="name" 
                            type="text" 
                            placeholder="IDENT_ID / FULL_NAME" 
                            className="w-full bg-emerald-950/10 border-b border-emerald-500/10 py-3 px-4 outline-none focus:border-emerald-500 focus:text-emerald-400 transition-all font-mono text-xs text-zinc-400 placeholder:text-zinc-800 uppercase" 
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-emerald-500/50 font-mono text-[9px] uppercase tracking-widest">SYS.INPUT(EMAIL):_</span>
                          <input 
                            required 
                            name="email" 
                            type="email" 
                            placeholder="SECURE_COMMS / EMAIL" 
                            className="w-full bg-emerald-950/10 border-b border-emerald-500/10 py-3 px-4 outline-none focus:border-emerald-500 focus:text-emerald-400 transition-all font-mono text-xs text-zinc-400 placeholder:text-zinc-800 uppercase" 
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-emerald-500/50 font-mono text-[9px] uppercase tracking-widest">SYS.INPUT(DATA):_</span>
                          <textarea 
                            required 
                            name="message" 
                            placeholder="Describe architecture requirements, scalability goals, or performance bottlenecks..." 
                            className="w-full bg-emerald-950/10 border border-emerald-500/10 py-3 px-4 outline-none focus:border-emerald-500 focus:text-emerald-400 transition-all font-mono text-xs h-32 resize-none text-zinc-400 placeholder:text-zinc-800 uppercase" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto flex justify-between items-center border-t border-emerald-900/20 pt-8 relative z-10 bg-black/50 backdrop-blur-sm -mx-12 px-12 pb-2">
            <button 
              type="button"
              onClick={prevStep} 
              disabled={currentStep === 0 || currentStep > STEPS.length}
              className="group flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 hover:text-emerald-400 disabled:opacity-0 transition-all cursor-pointer"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> [ ATRÁS ]
            </button>
            
            {currentStep === STEPS.length ? (
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="group flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-8 py-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "ENCRYPTING..." : "[ ENVIAR_BRIEFING ]"} <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            ) : currentStep < STEPS.length ? (
               <button
                 type="button"
                 onClick={() => {
                   if (formData[STEPS[currentStep].id]) setCurrentStep(prev => prev + 1);
                 }}
                 disabled={!formData[STEPS[currentStep].id]}
                 className="group flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/40 hover:text-emerald-400 disabled:opacity-20 transition-all cursor-pointer"
               >
                  [ SIGUIENTE ]
               </button>
            ) : (
              <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" /> SECURE_COMMS_ESTABLISHED
              </div>
            )}
          </div>
        </form>
      </BreathingContainer>
    </section>
  );
};
