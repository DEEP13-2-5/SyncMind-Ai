import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Server, BarChart2, Shield, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Landing() {
  const { user } = useAuth();

  // if (user) {
  //   return <Redirect to="/dashboard" />;
  // }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SynthMind AI" className="w-14 h-14 rounded-xl shadow-lg shadow-primary/20" />
          <span className="text-2xl font-bold font-display tracking-tight">SynthMind AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors cursor-pointer">
            Features
          </a>
          <Link href="/pricing">
            <span className="hover:text-primary transition-colors cursor-pointer">Pricing</span>
          </Link>
          <Link href="/docs">
            <span className="hover:text-primary transition-colors cursor-pointer">Documentation</span>
          </Link>
        </nav>
        {user ? (
          <Link href="/dashboard">
            <Button className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg glow-effect">
              View Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shadow-lg">
              Sign In
            </Button>
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-24 pb-32 text-center relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

        <h1 className="text-6xl md:text-8xl font-bold font-display tracking-tight mb-8 text-foreground max-w-5xl mx-auto leading-[1.1] drop-shadow-sm relative z-10">
          DevOps Performance <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-500 animate-gradient-x">
            Verified by AI
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed relative z-10">
          Simulate high-scale traffic, analyze GitHub repositories, and get AI-powered
          infrastructure recommendations in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-10 h-16 text-xl font-semibold bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95">
              Start for Free <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
        </div>

        {/* Hero Image / Visualization Mockup */}
        <div className="mt-24 relative mx-auto max-w-6xl group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative rounded-2xl bg-card border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
              alt="Dashboard Analytics Preview"
              className="w-full h-auto shadow-inner"
            />

            {/* Overlay UI Mockup Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Everything you need to scale</h2>
            <p className="text-muted-foreground text-lg">Comprehensive tools for modern DevOps teams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart2,
                title: "Load Testing",
                desc: "Simulate thousands of concurrent users to identify bottlenecks before production."
              },
              {
                icon: Shield,
                title: "GitHub Analysis",
                desc: "Scan your repository for infrastructure security vulnerabilities and best practices."
              },
              {
                icon: Zap,
                title: "AI Insights",
                desc: "Get actionable AI recommendations to optimize your stack and reduce costs."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SynthMind AI" className="w-8 h-8 rounded-lg" />
            <span className="font-bold font-display">SynthMind AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SynthMind AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
