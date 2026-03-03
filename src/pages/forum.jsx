import { motion } from "framer-motion";
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
} from "lucide-react";

import discussions from "@/data/Discussions";

export default function ForumPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

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
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Forum & Communauté</h1>
          <p className="text-white/90 mt-1">
            Pose tes questions, aide les autres, partage tes projets.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex gap-2 items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-2xl shadow-md font-medium w-fit"
        >
          <Users size={20} />
          <span>+ 90 membres actifs</span>
        </motion.div>
      </header>

      {/* SEARCH + FILTERS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-md"
      >
        <div className="relative w-full md:w-1/2">
          <input
            className="w-full border border-gray-300 rounded-xl py-2 md:py-3 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Rechercher une discussion..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Search
            size={20}
            className="absolute top-2.5 md:top-3 left-3 text-gray-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 transition"
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
      </motion.div>

      {/* DISCUSSIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((d, index) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
          >
            <Card className="hover:shadow-xl transition rounded-2xl cursor-pointer border border-gray-200">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {d.title}
                </CardTitle>
                <span className="bg-linear-to-r from-blue-500 via-sky-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {d.tag}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span>
                    Posté par <b>{d.author}</b>
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <MessageCircle size={16} /> {d.replies} réponses
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <ThumbsUp size={16} /> {d.likes}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">{d.date}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 items-center">
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
      </div>
    </div>
  );
}
