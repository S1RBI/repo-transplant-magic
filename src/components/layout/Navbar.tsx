
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">Volunteer Hub</Link>
        <div className="flex items-center gap-4">
          <Link to="/events">
            <Button variant="ghost">Мероприятия</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost">О нас</Button>
          </Link>
          <Link to="/login">
            <Button>Войти</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
