import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle2,
    BarChart2,
    Shield,
    Cpu,
    Zap,
    Activity,
    Layout,
    Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">

            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-20%] w-[40%] h-[40%] bg-primary/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[40%] h-[40%] bg-accent/10 blur-[140px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 glass">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" className="w-10 h-10 rounded-xl" />
                        <span className="text-2xl font-black text-gradient">SynthMind AI</span>
                    </div>

                    <nav className="hidden md:flex gap-8 text-sm font-semibold text-muted-foreground">
                        <a href="#features" className="hover:text-primary">Features</a>
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/docs">Docs</Link>
                    </nav>

                    <div className="flex gap-3">
                        {user ? (
                            <Link href="/dashboard">
                                <Button className="rounded-full px-6 font-bold">
                                    Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="rounded-full px-6 font-bold">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="flex-1">

                {/* Hero */}
                <section className="container mx-auto px-4 pt-24 pb-32 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
                        <Zap className="w-4 h-4" />
                        AI-Powered DevOps Validation
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6">
                        DevOps <span className="text-gradient">Launch Readiness</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Measure real traffic behavior, detect deployment risks,
                        and get AI-clear explanations before users hit production.
                    </p>

                    <Link href="/signup">
                        <Button size="lg" className="rounded-full px-12 h-16 text-lg font-bold">
                            Launch Your First Test <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="mt-24 max-w-6xl mx-auto">
                        <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            <img src="/dashboard-hero.png" className="w-full" />
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="py-32 bg-slate-50/50 dark:bg-black/20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl md:text-5xl font-black mb-16">
                            Built for High-Growth <span className="text-primary">Teams</span>
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: BarChart2,
                                    title: "Load Intelligence",
                                    desc: "Traffic patterns that reflect real users, not fake spikes.",
                                },
                                {
                                    icon: Shield,
                                    title: "GitHub & Docker Audits",
                                    desc: "CI/CD, Docker, and config risks flagged before deploy.",
                                },
                                {
                                    icon: Cpu,
                                    title: "AI Explanations",
                                    desc: "Clear reasoning behind failures — not just charts.",
                                },
                            ].map((f, i) => (
                                <div
                                    key={i}
                                    className="p-8 rounded-3xl glass-card border border-white/10"
                                >
                                    <f.icon className="w-8 h-8 text-primary mb-6" />
                                    <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                                    <p className="text-muted-foreground">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-16 border-t border-white/10">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2026 SynthMind AI. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
