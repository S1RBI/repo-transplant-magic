
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">© 2025 Volunteer Hub. Все права защищены.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">О нас</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Контакты</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Политика конфиденциальности</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
