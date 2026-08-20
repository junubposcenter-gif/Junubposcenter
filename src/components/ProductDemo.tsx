import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  MessageSquare, 
  BarChart3, 
  Printer,
  ChevronRight,
  X
} from 'lucide-react';

interface ProductDemoProps {
  onClose: () => void;
}

export const ProductDemo: React.FC<ProductDemoProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "LONGUN TECH AND AI AGENCY",
      subtitle: "Presents: South Sudan's Most Advanced ERP",
      description: "A precision-engineered solution for the modern branding industry. Built with high-performance cloud infrastructure.",
      icon: Rocket,
      color: "from-slate-900 to-black"
    },
    {
      title: "Core Logic Architecture",
      subtitle: "Secure. Scalable. Real-time.",
      description: "Powered by Firebase Real-time Synchronization and Advanced Security Rules, ensuring your data is always protected and instant.",
      icon: Cpu,
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "Unified Order Hub",
      subtitle: "From Intake to Fulfillment",
      description: "Manage complex printing jobs with surgical precision. Assign designers, track materials, and monitor timelines in real-time.",
      icon: Layers,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Real-time Collaboration",
      subtitle: "Zero-Latency Communication",
      description: "Staff and admins stay synced via built-in secure messaging. Notifications bridge the gap between creative and production.",
      icon: MessageSquare,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Financial Intelligence",
      subtitle: "Growth Driven by Data",
      description: "Monitor expenses, revenue, and funding with automated reporting. See your profitability in every print run.",
      icon: BarChart3,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Enterprise Security",
      subtitle: "Zero-Trust Protocol",
      description: "Identity integrity and role-based access control ensure that only authorized personnel can access sensitive financial data.",
      icon: ShieldCheck,
      color: "from-purple-500 to-pink-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (step < steps.length - 1) {
        setStep(s => s + 1);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [step, steps.length]);

  const IconComp = steps[step].icon;

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col">
      <div className="min-h-full w-full flex flex-col items-center justify-center py-20 pb-48">
        <button 
          onClick={onClose}
          className="fixed top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all z-[110]"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="max-w-4xl w-full px-6 text-center mb-12"
          >
          {step === 0 ? (
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-12"
              >
                <div className="w-32 h-32 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden relative group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                   <Rocket className="w-16 h-16 text-white" />
                </div>
              </motion.div>
              <p className="text-blue-600 font-black tracking-[0.3em] uppercase text-sm mb-4">A Masterpiece By</p>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">
                LONGUN TECH
              </h1>
              <div className="h-1 w-24 bg-blue-600 mb-8 mx-auto rounded-full" />
              <p className="text-slate-500 text-xl font-medium max-w-xl mx-auto">
                Transforming the printing industry with sophisticated artificial intelligence and enterprise workflow.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12 items-center text-left">
              <div className="space-y-6">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${steps[step].color} flex items-center justify-center shadow-xl`}>
                   <IconComp className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-2">Step 0{step}</h3>
                  <h2 className="text-5xl font-black text-slate-900 leading-tight mb-4">
                    {steps[step].title}
                  </h2>
                  <p className="text-xl font-bold text-slate-400 mb-6">
                    {steps[step].subtitle}
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {steps[step].description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                   {step < steps.length - 1 ? (
                     <button 
                       onClick={() => setStep(step + 1)}
                       className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-black transition-all"
                     >
                       Next Chapter <ChevronRight className="w-5 h-5" />
                     </button>
                   ) : (
                     <button 
                       onClick={onClose}
                       className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all"
                     >
                       Launch ERP Now <Rocket className="w-5 h-5" />
                     </button>
                   )}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner overflow-hidden flex items-center justify-center p-8">
                   {/* Animated Mock UI Elements */}
                   <div className="w-full space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="h-16 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4"
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${steps[step].color} opacity-20`} />
                          <div className="flex-1 space-y-2">
                             <div className="h-2 w-1/3 bg-slate-100 rounded" />
                             <div className="h-2 w-2/3 bg-slate-50 rounded" />
                          </div>
                        </motion.div>
                      ))}
                   </div>
                </div>
                {/* Decorative blobs */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${steps[step].color} opacity-5 blur-3xl rounded-full`} />
                <div className={`absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br ${steps[step].color} opacity-10 blur-3xl rounded-full`} />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[110]">
        {steps.map((_, i) => (
          <div 
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step ? 'w-12 bg-slate-900' : 'w-3 bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Footer Branding & Recording Tip */}
      <div className="fixed bottom-8 left-0 right-0 px-8 flex justify-between items-end z-[110]">
        <div className="text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
             Engineered for excellence
          </p>
          <p className="text-[9px] text-slate-300 font-medium">© 2024 Longun Tech & AI Agency</p>
        </div>
        
        <div className="bg-slate-50/50 backdrop-blur-sm border border-slate-100 rounded-xl px-4 py-3 max-w-[200px]">
           <button className="text-[9px] font-bold text-slate-500 mb-1 flex items-center gap-1.5 w-full text-left">
             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
             Capture Video?
           </button>
           <p className="text-[8px] text-slate-400 leading-tight">
             Use <b>Win + G</b> (Windows) or <b>Cmd + Shift + 5</b> (Mac) to record this sequence for your marketing presentation.
           </p>
        </div>
      </div>
    </div>
  );
};
