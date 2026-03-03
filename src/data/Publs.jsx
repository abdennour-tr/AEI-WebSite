const publicites = [
  {
    id: 1,
    titre: "Campagne Innovante AI",
    description: "Découvrez comment l'IA transforme la publicité digitale.",
    image:
      "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub1",
    couleur: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    titre: "Marketing Green",
    description: "Une campagne éco-responsable qui séduit tous les publics.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub2",
    couleur: "from-green-400 to-teal-500",
  },
  {
    id: 3,
    titre: "Tech & Futur",
    description: "Découvrez les technologies qui réinventent le marketing.",
    image:
      "https://images.unsplash.com/photo-1581092337772-6c5f5e08df2b?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub3",
    couleur: "from-blue-500 to-indigo-600",
  },
  {
    id: 4,
    titre: "Fashion Impact",
    description: "Campagne mode qui crée un buzz international.",
    image:
      "https://images.unsplash.com/photo-1495121605193-b116b5b09ef5?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub4",
    couleur: "from-pink-400 to-red-500",
  },
  {
    id: 5,
    titre: "Sports & Energie",
    description: "Une publicité dynamique pour motiver et inspirer.",
    image:
      "https://images.unsplash.com/photo-1526401485004-63f37e5d6206?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub5",
    couleur: "from-yellow-400 to-orange-500",
  },
  {
    id: 6,
    titre: "Food & Lifestyle",
    description: "Découvrez une campagne gourmande et engageante.",
    image:
      "https://images.unsplash.com/photo-1556912999-54c2c7df5f4d?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub6",
    couleur: "from-orange-400 to-red-400",
  },
  {
    id: 7,
    titre: "Travel Adventure",
    description: "Publicité immersive pour les passionnés de voyage.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub7",
    couleur: "from-teal-400 to-blue-500",
  },
  {
    id: 8,
    titre: "Gaming Revolution",
    description: "Découvrez la campagne qui fait vibrer la communauté gamer.",
    image:
      "https://images.unsplash.com/photo-1618354698672-8491a114d54b?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub8",
    couleur: "from-purple-600 to-indigo-700",
  },
  {
    id: 9,
    titre: "Startup Impact",
    description:
      "Une campagne innovante pour booster la visibilité des startups.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub9",
    couleur: "from-green-400 to-teal-500",
  },
  {
    id: 10,
    titre: "Art & Créativité",
    description: "Campagne artistique qui séduit et inspire l’audience.",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub10",
    couleur: "from-pink-500 to-purple-500",
  },
  {
    id: 11,
    titre: "Tech Mobile",
    description: "Publicité pour promouvoir les dernières innovations mobiles.",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub11",
    couleur: "from-blue-400 to-indigo-500",
  },
  {
    id: 12,
    titre: "Santé & Bien-être",
    description: "Une campagne engageante pour un mode de vie sain.",
    image:
      "https://images.unsplash.com/photo-1588776814546-5a83c1f4e7ed?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub12",
    couleur: "from-green-500 to-lime-500",
  },
  {
    id: 13,
    titre: "Education Future",
    description: "Une campagne éducative pour les écoles et universités.",
    image:
      "https://images.unsplash.com/photo-1581091215363-7e3df6d4034b?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub13",
    couleur: "from-yellow-400 to-orange-400",
  },
  {
    id: 14,
    titre: "Musique & Événement",
    description: "Campagne vibrante pour concerts et festivals.",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub14",
    couleur: "from-red-400 to-pink-500",
  },
  {
    id: 15,
    titre: "Mode Durable",
    description: "Promotion d’une mode responsable et tendance.",
    image:
      "https://images.unsplash.com/photo-1520975698512-9b8b9d0cbb3f?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub15",
    couleur: "from-green-400 to-teal-500",
  },
  {
    id: 16,
    titre: "Tech Gaming",
    description: "Publicité pour équipements gaming haut de gamme.",
    image:
      "https://images.unsplash.com/photo-1606813901951-8cbd3edc8c02?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub16",
    couleur: "from-purple-500 to-indigo-600",
  },
  {
    id: 17,
    titre: "Culinaire Créatif",
    description: "Campagne gourmande qui donne envie de cuisiner.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub17",
    couleur: "from-orange-400 to-red-400",
  },
  {
    id: 18,
    titre: "Voyage de Rêve",
    description: "Publicité immersive pour destinations de rêve.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub18",
    couleur: "from-teal-400 to-blue-500",
  },
  {
    id: 19,
    titre: "Fitness & Motivation",
    description: "Campagne dynamique pour inspirer à bouger.",
    image:
      "https://images.unsplash.com/photo-1594737625785-7b1425e8c7b6?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub19",
    couleur: "from-yellow-400 to-orange-500",
  },
  {
    id: 20,
    titre: "Innovation Tech",
    description: "Découvrez les dernières innovations tech pour tous.",
    image:
      "https://images.unsplash.com/photo-1581093588401-5e7f7e5a3c0f?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/pub20",
    couleur: "from-blue-500 to-indigo-600",
  },
];

export default publicites;
