
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Страница не найдена</p>
        <Link to="/">
          <Button>Вернуться на главную</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
