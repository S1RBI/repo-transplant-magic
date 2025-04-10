
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { volunteer, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="bg-white shadow-sm border-b py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-volunteer-purple rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-xl font-bold">Волонтер</h1>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-volunteer-purple transition-colors">
            Главная
          </Link>
          <Link to="/calendar" className="text-gray-700 hover:text-volunteer-purple transition-colors">
            Календарь
          </Link>
          <Link to="/events" className="text-gray-700 hover:text-volunteer-purple transition-colors">
            Мероприятия
          </Link>
          <Link to="/stats" className="text-gray-700 hover:text-volunteer-purple transition-colors">
            Статистика
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                    <UserCircle size={24} />
                    <span className="hidden md:inline">{volunteer?.name || "Пользователь"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Профиль</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/stats" className="cursor-pointer">Моя статистика</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" onClick={() => navigate('/auth')}>
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
