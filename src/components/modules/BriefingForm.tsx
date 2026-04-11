"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronLeft } from "lucide-react";
import { sendBriefing } from "@/app/actions";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";

const STEPS = [
  {
    id: "scope",
    question: "¿Cuál es la escala del proyecto?",
    options: ["E-commerce Headless", "Boutique Editorial", "SaaS / Web App", "Optimización Core Web Vitals"]
  },
  {
    id: "budget",
    question: "Rango de inversión estimada (CLP)",
    options: ["1.5M - 2.5M", "2.5M - 5M", "5M+", "Consultoría Mensual"]
  }
];

export const BriefingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => currentStep > 0 && currentStep <= STEPS.length && setCurrentStep(currentStep - 1);

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
    <section id="contact" className="py-32 px-8 max-w-4xl mx-auto">
      <div className="mb-16 border-l-2 border-zinc-800 pl-8">
        <RecursiveReveal>
          <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em]">
            {currentStep > STEPS.length ? "Complete" : `Step ${currentStep + 1} of 3`}
          </span>
        </RecursiveReveal>
        <RecursiveReveal delay={0.1}>
          <h2 className="text-4xl font-medium tracking-tighter mt-2">Project Briefing</h2>
        </RecursiveReveal>
      </div>

      <form action={clientAction} className="bg-zinc-900/30 border border-zinc-800 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
        <input type="hidden" name="scope" value={formData.scope || ""} />
        <input type="hidden" name="budget" value={formData.budget || ""} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {currentStep > STEPS.length ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[200px]">
                <h3 className="text-3xl font-light text-white mb-4">Request Submitted</h3>
                <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest">
                  System will process your briefing and we will contact you shortly.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl mb-10 tracking-tight font-light text-zinc-300">
                  {STEPS[currentStep]?.question || "Datos de contacto"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStep < STEPS.length && STEPS[currentStep].options.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelect(STEPS[currentStep].id, opt)}
                      className={`text-left p-4 border transition-all group relative overflow-hidden ${
                        formData[STEPS[currentStep].id] === opt 
                          ? "border-white bg-white/5" 
                          : "border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800/50"
                      }`}
                    >
                      <span className={`text-xs font-mono uppercase tracking-widest transition-colors ${
                        formData[STEPS[currentStep].id] === opt ? "text-white" : "text-zinc-500 group-hover:text-white"
                      }`}>
                        {opt}
                      </span>
                    </button>
                  ))}

                  {currentStep === STEPS.length && (
                    <div className="col-span-2 space-y-6">
                      <RecursiveReveal delay={0.1}>
                        <input required name="name" type="text" placeholder="NOMBRE / EMPRESA" className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-white transition-colors font-mono text-sm text-white" />
                      </RecursiveReveal>
                      <RecursiveReveal delay={0.2}>
                        <input required name="email" type="email" placeholder="EMAIL CORPORATIVO" className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-white transition-colors font-mono text-sm text-white" />
                      </RecursiveReveal>
                      <RecursiveReveal delay={0.3}>
                        <textarea required name="message" placeholder="DETALLES ADICIONALES" className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-white transition-colors font-mono text-sm h-32 resize-none text-white" />
                      </RecursiveReveal>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center border-t border-zinc-800 pt-8">
          <button 
            type="button"
            onClick={prevStep} 
            disabled={currentStep === 0 || currentStep > STEPS.length}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white disabled:opacity-0 transition-all cursor-pointer"
          >
            <ChevronLeft size={14} /> Back
          </button>
          
          {currentStep === STEPS.length ? (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-3 bg-white text-black px-8 py-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Submit Request"} <Send size={14} />
            </button>
          ) : currentStep < STEPS.length ? (
             <div className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                Select an option to proceed
             </div>
          ) : (
            <div className="text-[10px] font-mono text-green-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Channel Established
            </div>
          )}
        </div>
      </form>
    </section>
  );
};
