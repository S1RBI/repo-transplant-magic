
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Присоединяйтесь к сообществу волонтеров
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Найдите возможности для волонтерства, помогайте другим и меняйте мир к лучшему.
                Volunteer Hub объединяет волонтеров и организаторов.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/events">
                  <Button size="lg">Найти мероприятия</Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline">Стать волонтером</Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto">
              <div className="aspect-video overflow-hidden rounded-xl">
                <img
                  alt="Volunteers working together"
                  className="object-cover w-full h-full"
                  src="https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=80&w=1000"
                  width="550"
                  height="310"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Как это работает</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed mx-auto">
                Наша платформа объединяет волонтеров и организаторов, чтобы совместными усилиями менять мир к лучшему
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                1
              </div>
              <h3 className="text-xl font-bold">Поиск мероприятий</h3>
              <p className="text-muted-foreground text-center">
                Просматривайте список мероприятий и выбирайте те, которые вам интересны
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                2
              </div>
              <h3 className="text-xl font-bold">Присоединение</h3>
              <p className="text-muted-foreground text-center">
                Подайте заявку на участие в мероприятии и получите подтверждение от организатора
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                3
              </div>
              <h3 className="text-xl font-bold">Участие</h3>
              <p className="text-muted-foreground text-center">
                Помогайте и получайте ценный опыт, знакомьтесь с единомышленниками
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
