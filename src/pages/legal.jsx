import { ArrowLeft, BookOpenCheck, LockKeyhole, Scale, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/AEI.png";

const content = {
  privacy: {
    icon: LockKeyhole,
    eyebrow: "Protection des données",
    title: "Politique de confidentialité",
    intro: "Cette page explique quelles données sont utilisées par le portail AEI et comment chaque étudiant peut exercer ses droits.",
    sections: [
      ["Données collectées", "Le portail conserve les informations de compte, le profil étudiant, les publications, candidatures, favoris, inscriptions, interactions et préférences nécessaires à son fonctionnement."],
      ["Utilisation", "Ces données servent à sécuriser l’accès, personnaliser le parcours étudiant, gérer les clubs et permettre la modération. Elles ne sont pas vendues."],
      ["Accès et sécurité", "Les droits d’accès sont limités par rôle. Les responsables de clubs voient uniquement les données de leur club, tandis que les modérateurs et administrateurs accèdent aux outils nécessaires à leurs missions."],
      ["Vos droits", "Depuis votre profil, vous pouvez exporter vos données ou demander la suppression de votre compte. Une vérification administrative protège le compte contre les suppressions frauduleuses."],
    ],
  },
  terms: {
    icon: Scale,
    eyebrow: "Cadre d’utilisation",
    title: "Conditions d’utilisation",
    intro: "L’utilisation du portail implique le respect de la communauté étudiante, des clubs et des règles de publication.",
    sections: [
      ["Compte personnel", "Chaque compte est strictement personnel. L’utilisateur est responsable de la confidentialité de son mot de passe et de l’exactitude des informations publiées."],
      ["Publications", "Les clubs, projets, annonces et produits peuvent être vérifiés avant leur mise en ligne. L’administration peut refuser, masquer ou archiver un contenu non conforme."],
      ["Comportements interdits", "Sont interdits : l’usurpation d’identité, les contenus trompeurs ou discriminatoires, le harcèlement, le spam, les atteintes à la vie privée et toute activité illégale."],
      ["Responsabilité", "Les échanges entre membres restent sous leur responsabilité. Le portail fournit des outils de signalement et de modération, sans garantir les transactions conclues entre utilisateurs."],
    ],
  },
  community: {
    icon: BookOpenCheck,
    eyebrow: "Vie étudiante",
    title: "Règles de la communauté",
    intro: "Le portail AEI doit rester un espace utile, sûr et respectueux pour tous les étudiants et responsables de clubs.",
    sections: [
      ["Respect et inclusion", "Adressez-vous aux autres membres avec courtoisie. Les attaques personnelles, propos haineux, intimidations et discriminations ne sont pas tolérés."],
      ["Contenus utiles", "Publiez des informations claires, exactes et liées à la vie étudiante. Évitez les doublons, le démarchage abusif et les informations volontairement trompeuses."],
      ["Vie privée", "Ne partagez pas les coordonnées, documents ou images d’une autre personne sans son accord. Utilisez les canaux de contact prévus par le portail."],
      ["Signaler un problème", "Le bouton « Signaler » permet d’alerter les modérateurs. Les signalements abusifs ou utilisés pour harceler un membre peuvent eux-mêmes faire l’objet d’une mesure."],
    ],
  },
};

export default function LegalPage({ type }) {
  const page = content[type];
  const Icon = page.icon;
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4"><Link to="/connexion" className="flex items-center gap-3"><img src={logo} alt="AEI" className="h-9 w-auto" /><span className="font-black">Portail AEI</span></Link><Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-700"><ArrowLeft className="h-4 w-4" /> Retour au portail</Link></div></header>
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" /><span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950"><Icon className="h-7 w-7" /></span><p className="relative mt-6 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{page.eyebrow}</p><h1 className="relative mt-2 text-4xl font-black tracking-tight sm:text-5xl">{page.title}</h1><p className="relative mt-5 max-w-3xl text-base leading-8 text-slate-300">{page.intro}</p></section>
      <div className="mt-8 grid gap-5">{page.sections.map(([title, body], index) => <article key={title} className="portal-panel"><div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700">{String(index + 1).padStart(2, "0")}</span><div><h2 className="text-xl font-black">{title}</h2><p className="mt-3 text-base leading-8 text-slate-600">{body}</p></div></div></article>)}</div>
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900"><ShieldCheck className="h-6 w-6 shrink-0" />Pour toute question concernant vos données ou une décision de modération, utilisez votre profil ou contactez l’administration AEI.</div>
    </div>
  </main>;
}
