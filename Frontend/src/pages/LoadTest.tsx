import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRunLoadTest } from "@/hooks/use-load-test";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Play, Loader2, Github, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoadTest() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const runTest = useRunLoadTest();
  const [, setLocation] = useLocation();

  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState("");

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);

  const canStartTest = (user?.credits || 0) > 0 || user?.subscription.plan !== 'free';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStartTest) return;

    setIsSimulating(true);

    // Initial delay for immediate UI feedback
    setTimeout(() => {
      runTest.mutate(
        { url, githubRepo: repo || undefined },
        {
          onSuccess: (data: any) => {
            console.log("✅ Load test triggered successfully:", data.id);
            if (data.user) {
              updateUser(data.user);
            }
            setIsSimulating(false);
            // Redirect to dashboard instead of direct result page per latest requirement
            toast({
              title: "Load Test & Analysis Complete!",
              description: "Redirecting you to the dashboard to view insights...",
            });
            // Delay redirect to let toast be seen
            setTimeout(() => {
              setLocation("/dashboard");
            }, 2500);
          },
          onError: (error: any) => {
            console.error("❌ Test Mutation Error:", error);
            setIsSimulating(false);

            // Check for potential HTML response error
            let errorMessage = error.message;
            if (errorMessage?.includes("Unexpected token '<'")) {
              errorMessage = "Server error or timeout. Please check your URL and try again.";
            }

            toast({
              title: "Test Failed",
              description: errorMessage,
              variant: "destructive",
            });
          },
        }
      );
    }, 500);
  };

  if (!user) return null;

  if (user.credits === 0 && user.subscription.plan === 'free') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-destructive shadow-lg">
            <CardHeader>
              <CardTitle className="text-destructive">Free Trial Used</CardTitle>
              <CardDescription>
                You've used your 1 free load test. Subscribe to a plan to continue testing your infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation('/subscription')}
                className="w-full h-12 text-base font-semibold"
              >
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-display mb-2">Configure Load Test</h1>
          <p className="text-muted-foreground">
            Simulate traffic and analyze your infrastructure's resilience.
          </p>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader>
            <CardTitle>Test Parameters</CardTitle>
            <CardDescription>Enter the target URL and GitHub repository for deeper analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSimulating ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div
                    className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
                  ></div>
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg">Simulating Traffic...</h3>
                  <p className="text-sm text-muted-foreground">This may take a few minutes. Please wait.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">Target URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="url"
                      placeholder="https://api.your-service.com"
                      className="pl-9"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      type="url"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repo">GitHub Repository URL</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="repo"
                      placeholder="https://github.com/username/repo"
                      className="pl-9"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-6 mt-6"> {/* New wrapper div with space-y-6 and mt-6 */}
                  <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                    <p>
                      <span className="font-semibold">Note:</span> {user?.subscription.plan === 'free' ? 'This will consume 1 credit from your balance.' : 'Infinite tests included in your plan.'}
                      The test runs for approximately 5 seconds.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                    disabled={runTest.isPending || !canStartTest}
                  >
                    {runTest.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting...
                      </>
                    ) : !canStartTest ? (
                      "Buy credits to run test"
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" /> Start Simulation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
