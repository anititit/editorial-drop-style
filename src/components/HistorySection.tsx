import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getHistory, formatDate } from "@/lib/storage";
import { Clock, ChevronRight } from "lucide-react";

export function HistorySection() {
  const history = getHistory();

  if (history.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="pt-8 border-t border-border/30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="editorial-caption">Histórico</span>
      </div>

      <div className="space-y-2">
        {history.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            to={`/resultado/${item.id}`}
            className="flex items-center justify-between py-3 px-4 -mx-4 hover:bg-muted/50 transition-colors group"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {item.result.editorial?.headline || item.result.profile?.aesthetic_primary || "Leitura Estética"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(item.timestamp)}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>

      {history.length > 3 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          +{history.length - 3} mais
        </p>
      )}
    </motion.section>
  );
}
