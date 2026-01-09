import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Server, BarChart2, Shield, Zap, Cpu, Globe, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full z-50 border-b border-white/10 glass">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <img src="/logo.png" alt="SynthMind AI" className="relative w-12 h-12 rounded-xl" />
            </div>
            <span className="text-2xl font-black font-display tracking-tight text-gradient">SynthMind AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-all hover:scale-105">Features</a>
            <Link href="/pricing"><span className="hover:text-primary transition-all hover:scale-105 cursor-pointer">Pricing</span></Link>
            <Link href="/docs"><span className="hover:text-primary transition-all hover:scale-105 cursor-pointer">Docs</span></Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                  Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex font-semibold">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8 animate-bounce">
            <Zap className="w-4 h-4" />
            <span>Now with AI-Powered Remediation</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black font-display tracking-tighter mb-6 leading-[0.9] lg:leading-[1.1]">
            DevOps <span className="text-gradient">Launch Readiness</span>
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold text-foreground/80 mb-8 font-display">
            Measured by Data. <span className="text-primary italic">Explained by AI.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Generate real performance and deployment signals, then get clear 
            explanations only when you need them. No more guessing production stability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-2xl shadow-primary/40 hover:scale-105 transition-transform active:scale-95">
                Launch Your First Test <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <div className="flex -space-x-3 overflow-hidden">
               {[1,2,3,4].map(i => (
                 <img key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-background" src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
               ))}
               <div className="flex items-center justify-center h-10 px-3 bg-muted rounded-full ring-2 ring-background text-xs font-bold">
                 +2k
               </div>
            </div>
          </div>

          <div className="mt-24 relative mx-auto max-w-6xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-blue-500 to-accent rounded-[2rem] blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass-card">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                alt="SynthMind AI Dashboard"
                className="w-full h-auto opacity-90 hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex justify-between items-end">
                <div className="text-left">
                  <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1">Live Deployment</p>
                  <p className="text-2xl font-bold text-white">99.9% Success Rate</p>
                </div>
                <div className="flex gap-2">
                   <div className="h-2 w-12 bg-primary rounded-full" />
                   <div className="h-2 w-12 bg-primary/30 rounded-full" />
                   <div className="h-2 w-12 bg-primary/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32 relative overflow-hidden bg-slate-50/50 dark:bg-black/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mb-20">
              <h2 className="text-4xl md:text-5xl font-black font-display mb-6">Built for High-Growth <br/><span className="text-primary">Engineering Teams</span></h2>
              <p className="text-xl text-muted-foreground font-medium">We've automated the most tedious parts of DevOps so you can focus on building.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart2,
                  title: "Load Intelligence",
                  desc: "Sophisticated traffic patterns that mirror real user behavior, not just raw requests.",
                  color: "bg-blue-500"
                },
                {
                  icon: Shield,
                  title: "GitHub Resilience",
                  desc: "Automatic CI/CD and Docker audits that flag risks before they hit production.",
                  color: "bg-purple-500"
                },
                {
                  icon: Cpu,
                  title: "Neural Insights",
                  desc: "Our AI doesn't just show charts; it explains the 'why' and suggests the 'how'.",
                  color: "bg-emerald-500"
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/20">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color}/10 flex items-center justify-center text-foreground mb-8 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 md:p-24 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to ship with <br/><span className="text-primary">Confidence?</span></h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">Join 200+ teams who use SynthMind AI to verify their infrastructure daily.</p>
                <Link href="/signup">
                  <Button size="lg" className="rounded-full px-12 h-16 text-xl font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-2xl">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="space-y-6 max-w-xs">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SynthMind AI" className="w-8 h-8 rounded-lg" />
              <span className="font-black text-xl font-display tracking-tight text-gradient">SynthMind AI</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Empowering DevOps teams with AI-driven performance insights and deployment readiness.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-foreground/50">Product</h4>
              <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Features</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-primary cursor-pointer transition-colors">API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-foreground/50">Company</h4>
              <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">About</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-foreground/50">Legal</h4>
              <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Terms</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-16 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 SynthMind AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
