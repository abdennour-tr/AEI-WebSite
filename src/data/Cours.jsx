// src/data/Cours.js
const cours = [
  // --- Mathématiques ---
  {
    id: 1,
    titre: "Analyse 1",
    niveau: "CP1",
    pdf: "analyse1.pdf",
    categorie: "Math",
    description:
      "Introduction aux fonctions, limites, dérivées et continuité. Base fondamentale pour les études scientifiques.",
  },
  {
    id: 2,
    titre: "Algèbre Linéaire",
    niveau: "CP1",
    pdf: "algebre.pdf",
    categorie: "Math",
    description:
      "Vecteurs, matrices, systèmes linéaires et espaces vectoriels. Indispensable pour l’IA et l’ingénierie.",
  },
  {
    id: 3,
    titre: "Analyse 2",
    niveau: "CP2",
    pdf: "analyse2.pdf",
    categorie: "Math",
    description:
      "Intégration, séries numériques, suites et applications en physique et traitement du signal.",
  },
  {
    id: 4,
    titre: "Équations Différentielles",
    niveau: "CP2",
    pdf: "equations_diff.pdf",
    categorie: "Math",
    description:
      "Étude des équations différentielles ordinaires et leurs applications en modélisation et dynamique.",
  },

  // --- Statistiques ---
  {
    id: 5,
    titre: "Probabilités",
    niveau: "CP2",
    pdf: "proba.pdf",
    categorie: "Statistiques",
    description:
      "Variables aléatoires, lois de probabilité et espérance. Fondamentaux pour la Data Science.",
  },
  {
    id: 6,
    titre: "Statistiques Descriptives",
    niveau: "CI",
    pdf: "stat_desc.pdf",
    categorie: "Statistiques",
    description:
      "Analyse et visualisation des données : moyennes, variances, histogrammes et indicateurs clés.",
  },
  {
    id: 7,
    titre: "Statistiques Inférentielles",
    niveau: "CI",
    pdf: "stat_inf.pdf",
    categorie: "Statistiques",
    description:
      "Tests d’hypothèses, intervalles de confiance et estimation. Base des modèles IA prédictifs.",
  },

  // --- Informatique & IA ---
  {
    id: 8,
    titre: "Machine Learning",
    niveau: "CI",
    pdf: "ml.pdf",
    categorie: "IA",
    description:
      "Supervisé, non supervisé, régression, classification. Construction et évaluation de modèles ML.",
  },
  {
    id: 9,
    titre: "Deep Learning",
    niveau: "CI",
    pdf: "dl.pdf",
    categorie: "IA",
    description:
      "Réseaux neuronaux, CNN, RNN et architectures modernes. Applications en vision et NLP.",
  },
  {
    id: 10,
    titre: "Introduction à Python",
    niveau: "CP1",
    pdf: "python_intro.pdf",
    categorie: "Informatique",
    description:
      "Bases du langage Python : variables, boucles, fonctions et manipulation des données.",
  },
  {
    id: 11,
    titre: "Structures de Données",
    niveau: "CP2",
    pdf: "structures.pdf",
    categorie: "Informatique",
    description:
      "Listes, piles, arbres, graphes et algorithmes essentiels pour l’optimisation et l’IA.",
  },
  {
    id: 12,
    titre: "Systèmes d'Exploitation",
    niveau: "CI",
    pdf: "os.pdf",
    categorie: "Informatique",
    description:
      "Fonctionnement des OS : processus, mémoire, fichiers et gestion matérielle.",
  },

  // --- Physique ---
  {
    id: 13,
    titre: "Électromagnétisme",
    niveau: "CP1",
    pdf: "electro.pdf",
    categorie: "Physique",
    description:
      "Champs électriques et magnétiques, forces et applications en électronique.",
  },
  {
    id: 14,
    titre: "Mécanique du point",
    niveau: "CP1",
    pdf: "meca.pdf",
    categorie: "Physique",
    description:
      "Forces, énergie, mouvement et lois de Newton. Base de toute modélisation physique.",
  },
  {
    id: 15,
    titre: "Thermodynamique",
    niveau: "CP2",
    pdf: "thermo.pdf",
    categorie: "Physique",
    description:
      "Étude des systèmes thermiques : chaleur, énergie, entropie et transformations.",
  },

  // --- Langues ---
  {
    id: 16,
    titre: "Anglais Technique",
    niveau: "CI",
    pdf: "anglais.pdf",
    categorie: "Langues",
    description:
      "Anglais scientifique et professionnel : vocabulaire technique et communication internationale.",
  },
  {
    id: 17,
    titre: "Communication Professionnelle",
    niveau: "CP2",
    pdf: "communication.pdf",
    categorie: "Langues",
    description:
      "Techniques d’expression orale et écrite, présentation, CV et communication en entreprise.",
  },
];

export default cours;
