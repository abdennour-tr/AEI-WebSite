import event1 from "../assets/events/event1.png";
import event2 from "../assets/events/event2.png";
import event3 from "../assets/events/event3.png";
import { useState } from "react";

function HomePage() {
  const events = [
    {
      title: "Journée d’intégration",
      date: "Octobre 2025",
      description: "Accueil des nouveaux étudiants et activités culturelles.",
      image: event1,
    },
    {
      title: "Hackathon IA",
      date: "Novembre 2025",
      description: "Compétition autour de l’intelligence artificielle.",
      image: event2,
    },
    {
      title: "Conférence Entrepreneuriat",
      date: "Décembre 2025",
      description: "Rencontre avec des entrepreneurs et startups.",
      image: event3,
    },
  ];

  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % events.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      {/* Hero section */}
      <section className="bg-linear-to-r from-sky-500 to-teal-400 text-white rounded-lg px-6 py-12 sm:px-12 sm:py-12 flex flex-col items-center text-center space-y-6 shadow-lg">
        <h1 className="text-4xl font-bold">
          Bienvenue sur le Portail Étudiant
        </h1>
        <p className="text-lg max-w-xl">
          Découvrez toutes vos ressources, annonces et outils IA au même
          endroit.
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button className="bg-white text-sky-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
            Découvrir les cours
          </button>
          <button className="bg-white text-sky-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
            Voir les annonces
          </button>
        </div>
      </section>

      {/* Events Carousel */}
      <section className="relative max-w-6xl mx-auto rounded-xl overflow-hidden shadow-xl">
        <div className="relative h-[260px] sm:h-[350px] lg:h-[420px]">
          {events.map((event, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-6 left-6 right-6 text-white max-w-xl">
                <p className="text-sm text-sky-300 font-medium mb-1">
                  {event.date}
                </p>
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-200">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-md transition"
        >
          ‹
        </button>

        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-md transition"
        >
          ›
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {events.map((_, index) => (
            <span
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition ${
                index === current ? "bg-sky-400" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Latest announcements section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Dernières annonces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Exemple de carte d'annonce */}
          <div className="bg-white w-full p-4 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">Colocation proche campus</h3>
            <p className="text-gray-500 text-sm">
              2 chambres disponibles, 350 DH / mois
            </p>
          </div>
          <div className="bg-white w-full p-4 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">Cours de mathématiques</h3>
            <p className="text-gray-500 text-sm">
              Notes et exercices corrigés disponibles
            </p>
          </div>
          <div className="bg-white w-full p-4 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">Stage en IA</h3>
            <p className="text-gray-500 text-sm">
              Opportunité pour étudiants en 3ème année
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-sky-100 px-6 py-8 sm:px-12 sm:py-12 rounded-lg text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Besoin d’aide ?</h2>
          <p className="text-gray-700 mb-4">
            Notre Chatbot IA est là pour répondre à vos questions rapidement.
          </p>
          <button className="bg-sky-700 text-white px-6 py-3 rounded-md hover:bg-sky-800 transition">
            Lancer le Chatbot
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
