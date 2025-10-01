import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card px-3 md:px-6 flex items-center justify-between shadow-card sticky top-0 z-30">
      <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder={isMobile ? "Search..." : "Search patients, conditions, medications..."} 
            className="pl-10 w-full"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-destructive rounded-full"></span>
        </Button>
        
        {!isMobile && (
          <div className="flex items-center space-x-3 border-l border-border pl-4">
            <div className="text-right">
              <p className="text-sm font-medium">Dr. Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">Endocrinologist</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {isMobile && (
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}