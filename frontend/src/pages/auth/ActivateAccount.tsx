import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";

export default function ActivateAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const activateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/auth/set-password", data);
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Account Activated!",
        description: "Your password has been set. You can now login to ClaimSync.",
      });
      setTimeout(() => navigate("/login"), 2000);
    },
    onError: (err: any) => {
      toast({
        title: "Activation Failed",
        description: err.response?.data?.message || "Invalid or expired activation link.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords mismatch",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: "Password too weak",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    activateMutation.mutate({ token, password });
  };

  if (activateMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md w-full bg-card border rounded-xl p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
           <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight">Account Activated!</h1>
           <p className="text-muted-foreground">Redirecting you to the login page...</p>
           <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="max-w-md w-full bg-card border rounded-2xl p-8 shadow-xl space-y-8">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2 rotate-3 hover:rotate-0 transition-transform duration-300">
             <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Activate Account</h1>
          <p className="text-muted-foreground text-sm">
            Welcome to the enterprise reimbursement portal. Please set your secure password to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Min 8 characters" 
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Repeat your password" 
                  className="pl-10 h-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold text-base shadow-lg hover:shadow-xl transition-all" 
            disabled={activateMutation.isPending}
          >
            {activateMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : "Activate & Login"}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground border-t pt-6">
          System secured by ClaimSync Enterprise Infrastructure
        </div>
      </div>
    </div>
  );
}
