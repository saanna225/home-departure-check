import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";

export default function AdminSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Check if user is already an admin
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!error && data) {
      setIsAdmin(true);
    }
    
    setLoading(false);
  };

  const makeAdmin = async () => {
    if (!user) return;

    setLoading(true);
    
    const { data, error } = await supabase.functions.invoke('grant-admin', {
      body: { action: 'self-admin' }
    });

    if (error || !data?.success) {
      const errorMsg = data?.error || error?.message || 'Failed to grant admin access';
      if (errorMsg.includes('configured admin email')) {
        toast.error("Access Denied: Only the configured admin email can access this page");
      } else {
        toast.error(errorMsg);
      }
      console.error('Admin grant error:', error || data?.error);
    } else {
      toast.success("You are now an admin!");
      setIsAdmin(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Admin Setup</CardTitle>
            </div>
            <CardDescription>
              Grant yourself admin privileges to view and manage feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">You are already an admin!</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <strong>Security Check:</strong> Only the configured admin email can grant themselves admin access. 
                    If you're not the authorized admin, this action will be denied.
                  </p>
                </div>
                <Button onClick={makeAdmin} disabled={loading} className="w-full">
                  {loading ? "Verifying access..." : "Request Admin Access"}
                </Button>
              </>
            )}

            {isAdmin && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium">What's next?</p>
                <Button onClick={() => navigate("/feedback")} className="w-full">
                  View Feedback Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400 text-base">
              Important Security Note
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              • Only trusted individuals should have admin access
            </p>
            <p>
              • Admins can view all customer feedback including names and comments
            </p>
            <p>
              • Regular users cannot access the feedback dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
