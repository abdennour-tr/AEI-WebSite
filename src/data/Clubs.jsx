import galleryCampus from "../assets/events/event1.png";
import galleryChallenge from "../assets/events/event2.png";
import galleryMeetup from "../assets/events/event3.png";

const clubs = [
  {
    id: "innoverse",
    name: "InnoVerse",
    shortName: "IV",
    category: "Développement & innovation",
    icon: "code",
    accent: "violet",
    tagline: "Imaginer, coder et transformer des idées en projets numériques.",
    description:
      "Le club d’innovation informatique de l’ENIAD réunit les étudiants intéressés par le développement, les API, le DevOps, l’intelligence artificielle et la création de produits numériques.",
    activities: [
      "Ateliers de développement web et mobile",
      "Hackathons et compétitions de programmation",
      "Conférences techniques et rencontres inter-écoles",
      "Conception de projets en équipe",
    ],
    highlights: ["TechConnect", "ENIGMA Verse", "Ateliers API & microservices"],
    joinSteps: [
      "Suivre la page du club et repérer l’appel à candidatures.",
      "Choisir un pôle : technique, événementiel, média ou partenariat.",
      "Présenter sa motivation et ses disponibilités lors d’un court échange.",
    ],
    contactLabel: "Contacter InnoVerse",
    contactUrl: "https://www.linkedin.com/company/innoverseeniad",
  },
  {
    id: "nurlai",
    name: "NurlAI",
    shortName: "AI",
    category: "IA & Data",
    icon: "brain",
    accent: "sky",
    tagline: "Apprendre l’intelligence artificielle par la pratique.",
    description:
      "NurlAI propose une immersion concrète dans le machine learning, la data science et l’IA responsable, à travers des laboratoires pratiques, des panels et des projets collaboratifs.",
    activities: [
      "Hands-on labs en machine learning",
      "Exploration et visualisation de données",
      "Panels autour de l’IA responsable et inclusive",
      "Projets de data science accompagnés",
    ],
    highlights: ["Hands-on Lab ML", "Rise Her", "Sessions Data Science"],
    joinSteps: [
      "Participer à une session ouverte pour découvrir le club.",
      "Indiquer son niveau et les sujets IA que l’on souhaite explorer.",
      "Rejoindre une équipe de formation, de projet ou d’organisation.",
    ],
    contactLabel: "Voir les activités NurlAI",
    contactUrl:
      "https://fr.linkedin.com/posts/eniadberkane_nurlai-machinelearning-datascience-activity-7305043421591658497-63h8",
  },
  {
    id: "riot",
    name: "RIoT ENIADB",
    shortName: "RIoT",
    category: "Robotique & IoT",
    icon: "robot",
    accent: "amber",
    tagline: "Construire, programmer et donner vie aux systèmes intelligents.",
    description:
      "Le club Robotics & IoT rassemble les passionnés de robotique, d’électronique, de systèmes embarqués et d’objets connectés autour de formations et de réalisations techniques.",
    activities: [
      "Initiation à la robotique et aux capteurs",
      "Ateliers systèmes embarqués et IoT",
      "Montage et programmation de prototypes",
      "Participation à des challenges technologiques",
    ],
    highlights: ["Formation robotique avec InnoRobot", "Prototypage IoT", "Démonstrations techniques"],
    joinSteps: [
      "Venir à une démonstration ou un atelier d’initiation.",
      "Préciser ses centres d’intérêt : code, électronique, mécanique ou média.",
      "Intégrer un projet encadré, même sans expérience préalable.",
    ],
    contactLabel: "Découvrir RIoT",
    contactUrl:
      "https://fr.linkedin.com/posts/er-rami-hamza-064255237_robotique-formation-innovation-activity-7450596185637163008-3nxq",
  },
  {
    id: "secora",
    name: "SECORA Club",
    shortName: "SEC",
    category: "Cybersécurité",
    icon: "shield",
    accent: "rose",
    tagline: "Comprendre la sécurité informatique en relevant des défis concrets.",
    description:
      "SECORA est le club de cybersécurité des étudiants de l’ENIAD. Il développe les compétences en ethical hacking, OSINT, cryptographie, stéganographie et sécurité des réseaux.",
    activities: [
      "Capture The Flag et challenges de sécurité",
      "Ateliers OSINT, crypto et stéganographie",
      "Sensibilisation aux bonnes pratiques numériques",
      "Préparation aux compétitions de cybersécurité",
    ],
    highlights: ["CTF local ENIAD", "Challenges OSINT", "Ateliers ethical hacking"],
    joinSteps: [
      "Consulter les annonces des prochaines sessions d’initiation.",
      "Choisir un domaine à découvrir, sans prérequis obligatoire.",
      "Participer aux entraînements et rejoindre une équipe CTF.",
    ],
    contactLabel: "Contacter SECORA",
    contactUrl: "https://ma.linkedin.com/company/secoraclub",
  },
  {
    id: "techrise",
    name: "TechRise",
    shortName: "TR",
    category: "Innovation & carrière",
    icon: "rocket",
    accent: "indigo",
    tagline: "Relier compétences technologiques, innovation et monde professionnel.",
    description:
      "TechRise est dédié à l’innovation technologique, à l’entrepreneuriat et au développement de compétences pratiques grâce à des conférences, hackathons, ateliers et rencontres professionnelles.",
    activities: [
      "Conférences et rencontres avec des experts",
      "Hackathons et ateliers d’innovation",
      "Préparation à la vie professionnelle",
      "Organisation du Forum de l’Entreprise",
    ],
    highlights: ["Forum de l’Entreprise ENIADB", "Ateliers carrière", "Rencontres entreprises"],
    joinSteps: [
      "Identifier le pôle correspondant à ses objectifs.",
      "Participer à une réunion d’information ou à un événement.",
      "Contribuer à l’organisation, aux partenariats ou aux activités techniques.",
    ],
    contactLabel: "Contacter TechRise",
    contactUrl: "https://www.linkedin.com/company/techriseeniadb",
  },
  {
    id: "enactus",
    name: "Enactus ENIAD Berkane",
    shortName: "EN",
    category: "Entrepreneuriat social",
    icon: "lightbulb",
    accent: "emerald",
    tagline: "Entreprendre pour créer un impact social durable.",
    description:
      "Enactus encourage l’esprit entrepreneurial, le leadership et l’innovation sociale. Les membres identifient des besoins concrets et développent des solutions viables en équipe.",
    activities: [
      "Conception de projets à impact",
      "Études terrain et validation de besoins",
      "Formation en entrepreneuriat et pitch",
      "Compétitions et présentations de projets",
    ],
    highlights: ["Projets d’impact social", "Sessions de pitch", "Entrepreneuriat étudiant"],
    joinSteps: [
      "Découvrir les projets actifs de l’équipe.",
      "Présenter les causes ou compétences que l’on souhaite apporter.",
      "Rejoindre un projet ou un pôle support selon ses disponibilités.",
    ],
    contactLabel: "Contacter Enactus",
    contactUrl: "https://www.linkedin.com/company/enactus-eniad-berkane",
  },
  {
    id: "al-ataa",
    name: "Club Al Ataa",
    shortName: "AA",
    category: "Solidarité & citoyenneté",
    icon: "heart",
    accent: "red",
    tagline: "Mobiliser la communauté étudiante autour d’actions solidaires.",
    description:
      "Al Ataa porte les initiatives citoyennes et humanitaires de la communauté ENIAD. Le club permet à chaque étudiant de contribuer à des actions utiles, concrètes et collectives.",
    activities: [
      "Campagnes de don du sang",
      "Actions solidaires et bénévolat",
      "Sensibilisation à l’engagement citoyen",
      "Coordination avec des associations locales",
    ],
    highlights: ["Campagne de don du sang", "Actions de bénévolat", "Mobilisation étudiante"],
    joinSteps: [
      "Consulter le calendrier des prochaines actions.",
      "Signaler ses disponibilités et les causes qui lui tiennent à cœur.",
      "Participer comme bénévole puis rejoindre l’équipe d’organisation.",
    ],
    contactLabel: "Découvrir Al Ataa",
    contactUrl:
      "https://www.linkedin.com/posts/ade-eniad_thankyoudonors-donateblood-savelives-activity-7298455580837306368-5LIT",
  },
];

const sharedBoard = [
  { name: "Présidence", role: "Coordination générale", initials: "PR" },
  { name: "Responsable activités", role: "Programme & événements", initials: "RA" },
  { name: "Responsable communication", role: "Média & communauté", initials: "RC" },
];

const clubProfiles = {
  innoverse: {
    founded: "Club technologique",
    recruitment: "Candidatures ouvertes toute l’année",
    objectives: [
      "Transformer les acquis techniques en produits numériques concrets.",
      "Créer des équipes pluridisciplinaires autour de défis réels.",
      "Développer la culture du partage et du mentorat entre promotions.",
    ],
    upcomingEvents: [
      { title: "Atelier API & microservices", date: "Date bientôt annoncée", location: "ENIAD — salle de projet", type: "Atelier" },
      { title: "Session de découverte des pôles", date: "Prochaine campagne", location: "Campus ENIAD", type: "Rencontre" },
    ],
    projects: [
      { title: "TechConnect", description: "Rencontres techniques et partage d’expériences autour des métiers du numérique.", tag: "Communauté" },
      { title: "ENIGMA Verse", description: "Challenge collaboratif mobilisant conception, développement et communication.", tag: "Challenge" },
    ],
  },
  nurlai: {
    founded: "Club IA & Data",
    recruitment: "Ouvert aux débutants et aux profils avancés",
    objectives: [
      "Rendre l’intelligence artificielle accessible par des ateliers pratiques.",
      "Accompagner les étudiants dans leurs premiers projets data.",
      "Promouvoir une utilisation responsable, inclusive et utile de l’IA.",
    ],
    upcomingEvents: [
      { title: "Hands-on Lab Machine Learning", date: "Date bientôt annoncée", location: "Laboratoire informatique", type: "Laboratoire" },
      { title: "Rencontre Data Science", date: "Calendrier en préparation", location: "Campus ENIAD", type: "Échange" },
    ],
    projects: [
      { title: "Rise Her", description: "Initiative autour de l’inclusion, du partage d’expérience et de la place des étudiantes dans la tech.", tag: "Impact" },
      { title: "Data Science Sessions", description: "Parcours progressif de découverte, préparation des données et modélisation.", tag: "Formation" },
    ],
  },
  riot: {
    founded: "Club robotique & systèmes embarqués",
    recruitment: "Aucun prérequis technique obligatoire",
    objectives: [
      "Apprendre la robotique en construisant des prototypes fonctionnels.",
      "Relier programmation, électronique, mécanique et design produit.",
      "Préparer des équipes capables de participer à des challenges techniques.",
    ],
    upcomingEvents: [
      { title: "Initiation capteurs & microcontrôleurs", date: "Date bientôt annoncée", location: "Atelier ENIAD", type: "Formation" },
      { title: "Démonstration de prototypes", date: "Calendrier en préparation", location: "Hall du campus", type: "Démonstration" },
    ],
    projects: [
      { title: "Formation avec InnoRobot", description: "Cycle d’initiation aux bases de la robotique et à la réalisation de prototypes.", tag: "Formation" },
      { title: "Prototypage IoT", description: "Expérimentations autour des capteurs, de la collecte de données et des objets connectés.", tag: "Prototype" },
    ],
  },
  secora: {
    founded: "Club cybersécurité",
    recruitment: "Parcours progressif, du débutant au compétiteur",
    objectives: [
      "Développer les réflexes essentiels de sécurité numérique.",
      "Former des équipes aux challenges CTF et à la résolution d’incidents.",
      "Diffuser une culture éthique de la cybersécurité sur le campus.",
    ],
    upcomingEvents: [
      { title: "Initiation OSINT", date: "Date bientôt annoncée", location: "Salle informatique", type: "Atelier" },
      { title: "Entraînement CTF", date: "Calendrier en préparation", location: "Campus ENIAD", type: "Challenge" },
    ],
    projects: [
      { title: "CTF local ENIAD", description: "Challenges de cryptographie, investigation, web et sécurité réseau en équipe.", tag: "Compétition" },
      { title: "Cyber Awareness", description: "Actions de sensibilisation aux risques numériques et aux bonnes pratiques.", tag: "Sensibilisation" },
    ],
  },
  techrise: {
    founded: "Club innovation & carrière",
    recruitment: "Pôles événementiel, partenariat et contenu",
    objectives: [
      "Rapprocher les étudiants des entreprises et des professionnels.",
      "Développer les compétences de communication, d’organisation et de leadership.",
      "Créer des rendez-vous utiles pour l’orientation et l’employabilité.",
    ],
    upcomingEvents: [
      { title: "Rencontre métiers de l’ingénieur", date: "Date bientôt annoncée", location: "Amphithéâtre ENIAD", type: "Conférence" },
      { title: "Préparation Forum de l’Entreprise", date: "Campagne à venir", location: "Campus ENIAD", type: "Organisation" },
    ],
    projects: [
      { title: "Forum de l’Entreprise ENIADB", description: "Rencontre entre étudiants, recruteurs et professionnels autour des métiers et opportunités.", tag: "Carrière" },
      { title: "Ateliers carrière", description: "Sessions pratiques de préparation, communication professionnelle et découverte des métiers.", tag: "Compétences" },
    ],
  },
  enactus: {
    founded: "Équipe d’entrepreneuriat social",
    recruitment: "Rejoignez un projet ou un pôle support",
    objectives: [
      "Concevoir des solutions viables à des problématiques sociales réelles.",
      "Former les étudiants à l’étude terrain, au modèle économique et au pitch.",
      "Développer le leadership et la gestion de projet à impact.",
    ],
    upcomingEvents: [
      { title: "Découverte des projets actifs", date: "Date bientôt annoncée", location: "Campus ENIAD", type: "Présentation" },
      { title: "Atelier pitch & impact", date: "Calendrier en préparation", location: "Salle de projet", type: "Atelier" },
    ],
    projects: [
      { title: "Parcours projets à impact", description: "Identification de besoins, validation terrain et construction de solutions durables.", tag: "Impact social" },
      { title: "Sessions de pitch", description: "Accompagnement à la présentation claire d’un problème, d’une solution et de son impact.", tag: "Entrepreneuriat" },
    ],
  },
  "al-ataa": {
    founded: "Club solidarité & citoyenneté",
    recruitment: "Bénévoles et organisateurs bienvenus",
    objectives: [
      "Mobiliser les étudiants autour d’actions solidaires utiles et mesurables.",
      "Créer des liens durables avec les associations et acteurs locaux.",
      "Faire du bénévolat une expérience accessible à toute la communauté.",
    ],
    upcomingEvents: [
      { title: "Prochaine action solidaire", date: "Date bientôt annoncée", location: "Berkane", type: "Bénévolat" },
      { title: "Réunion des nouveaux bénévoles", date: "Calendrier en préparation", location: "Campus ENIAD", type: "Rencontre" },
    ],
    projects: [
      { title: "Campagne de don du sang", description: "Mobilisation et sensibilisation de la communauté autour du don du sang.", tag: "Santé" },
      { title: "Actions de bénévolat", description: "Initiatives solidaires menées avec des associations et partenaires locaux.", tag: "Citoyenneté" },
    ],
  },
};

const gallery = [
  { src: galleryCampus, alt: "Illustration d’une journée associative étudiante", caption: "Vie associative sur le campus" },
  { src: galleryChallenge, alt: "Illustration d’un challenge technologique", caption: "Challenges et apprentissage par la pratique" },
  { src: galleryMeetup, alt: "Illustration d’une rencontre professionnelle", caption: "Rencontres, échanges et réseau" },
];

export default clubs.map((club) => ({
  ...club,
  ...clubProfiles[club.id],
  board: sharedBoard,
  gallery,
  testimonials: [],
  socials: [{ label: "LinkedIn", url: club.contactUrl }],
}));
