import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Users,
  ThumbsUp,
  Search,
  LoaderCircle,
} from "lucide-react";

import fallbackDiscussions from "@/data/Discussions";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { forumApi } from "@/services/portalApi";

export default function ForumPage() {
  const { data: discussions, loading, error, setData } = usePortalCollection(
    forumApi.listTopics,
    fallbackDiscussions
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [likeError, setLikeError] = useState("");

  const toggleLike = async (discussion) => {
    const nextLiked = !discussion.isLiked;
    setLikeError("");
    setData((items) =>
      items.map((item) =>
        item.id === discussion.id
          ? {
              ...item,
              isLiked: nextLiked,
              likes: Math.max(0, item.likes + (nextLiked ? 1 : -1)),
            }
          : item
      )
    );

    try {
      await forumApi.setLike(discussion.id, nextLiked);
    } catch (toggleError) {
      setData((items) =>
        items.map((item) =>
          item.id === discussion.id
            ? {
                ...item,
                isLiked: discussion.isLiked,
                likes: discussion.likes,
              }
            : item
        )
      );
      setLikeError(toggleError.message || "Le vote n’a pas pu être enregistré.");
    }
  };

  const tags = [
    "Carrière",
    "Machine Learning",
    "PFE",
    "Développement",
    "Informatique",
  ];

  // Filtrage discussions
  const filtered = discussions
    .filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
    .filter((d) =>
      selectedTags.length > 0 ? selectedTags.includes(d.tag) : true
    );

  const discussionsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / discussionsPerPage);
  const paginated = filtered.slice(
    (page - 1) * discussionsPerPage,
    page * discussionsPerPage
  );

  return (
    <div className="portal-page">
      <PageHeader
        icon={MessageCircle}
        eyebrow="Communauté AEI"
        title="Forum & Communauté"
        description="Posez vos questions, partagez vos idées et avancez avec les autres étudiants."
      >
        <Motion.div
          whileHover={{ scale: 1.05 }}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-sky-100 backdrop-blur-sm"
        >
          <Users size={20} />
          <span>+ 90 membres actifs</span>
        </Motion.div>
      </PageHeader>

      {/* SEARCH + FILTERS */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="portal-panel flex flex-col items-center justify-between gap-4 md:flex-row"
      >
        <div className="relative w-full md:w-1/2">
          <input
            className="portal-input pl-10"
            placeholder="Rechercher une discussion..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Search
            size={20}
            className="absolute left-3 top-3 text-slate-400"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer rounded-full border-slate-200 px-3 py-1.5 text-xs transition hover:bg-sky-50 hover:text-sky-700"
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                )
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      </Motion.div>

      {likeError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {likeError}
        </p>
      )}

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des discussions…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger les discussions.
        </div>
      )}

      {/* DISCUSSIONS LIST */}
      {!loading && !error && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {paginated.map((d, index) => (
          <Motion.div
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
          >
            <Card className="h-full cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <CardTitle className="text-lg font-bold text-slate-950">
                  {d.title}
                </CardTitle>
                <span className="portal-badge shrink-0">
                  {d.tag}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span>
                    Posté par <b>{d.author}</b>
                  </span>
                  <span className="flex items-center gap-1 text-sky-700">
                    <MessageCircle size={16} /> {d.replies} réponses
                  </span>
                  <button
                    type="button"
                    aria-pressed={d.isLiked}
                    onClick={() => toggleLike(d)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition ${
                      d.isLiked
                        ? "bg-sky-100 text-sky-800"
                        : "text-sky-700 hover:bg-sky-50"
                    }`}
                  >
                    <ThumbsUp size={16} fill={d.isLiked ? "currentColor" : "none"} /> {d.likes}
                  </button>
                </div>
                <span className="text-xs text-slate-400">{d.date}</span>
              </CardContent>
            </Card>
          </Motion.div>
        ))}
      </div>}

      {!loading && !error && discussions.length === 0 && (
        <div className="portal-empty">Aucune discussion publiée pour le moment.</div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 items-center">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <ChevronLeft />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={page === i + 1 ? "default" : "outline"}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}

        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight />
        </Button>
      </div>}
    </div>
  );
}
