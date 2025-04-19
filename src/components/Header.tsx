
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <div className="mr-4 flex items-center">
            <div className="w-8 h-8 rounded-md bg-brand-purple flex items-center justify-center mr-2">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-xl font-bold">Deshi Drop Detective</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end" forceMount>
                <div className="grid gap-1">
                  <div className="flex items-center justify-start gap-2 rounded-md p-2 text-sm">
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <Button variant="ghost" className="justify-start text-sm" onClick={handleLogout}>
                    Log Out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                size="sm"
              >
                Log In
              </Button>
              <Button 
                onClick={() => navigate('/signup')}
                size="sm"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
