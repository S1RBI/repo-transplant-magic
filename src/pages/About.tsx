
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">О Volunteer Hub</h1>
      
      <div className="max-w-3xl mx-auto mb-12">
        <p className="text-lg mb-4">
          Volunteer Hub — это платформа, созданная для объединения волонтеров и организаторов 
          социальных мероприятий. Наша миссия — сделать волонтерство доступным 
          и удобным для всех желающих помогать.
        </p>
        <p className="text-lg mb-4">
          Мы верим, что каждый человек может внести вклад в развитие общества, 
          и стремимся предоставить все необходимые инструменты для этого.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Наши ценности</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Доступность</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Мы стремимся сделать волонтерство доступным для всех, независимо от опыта и навыков.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сообщество</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Мы создаем сильное сообщество единомышленников, объединенных желанием помогать другим.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Прозрачность</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Мы обеспечиваем прозрачность всех процессов и открыты для обратной связи.</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Присоединяйтесь к нам</h2>
      
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-lg mb-8">
          Если вы разделяете наши ценности и хотите стать частью нашего сообщества, 
          присоединяйтесь к Volunteer Hub уже сегодня!
        </p>
      </div>
    </div>
  );
};

export default About;
