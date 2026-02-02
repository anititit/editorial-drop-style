import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LogOut, 
  RefreshCw, 
  ChevronDown, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type ProRequest = {
  id: string;
  order_code: string;
  name: string;
  email: string;
  whatsapp: string;
  objective: string | null;
  platform: string | null;
  occasion: string | null;
  tone: string | null;
  budget: string | null;
  reference_urls: string[];
  status: string;
  created_at: string;
};

type Status = "pending" | "in_progress" | "completed";

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof Clock; className: string }> = {
  pending: { 
    label: "Pendente", 
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  in_progress: { 
    label: "Em andamento", 
    icon: AlertCircle,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  },
  completed: { 
    label: "Concluído", 
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<ProRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth", { replace: true });
        }
      }
    );

    checkAdminAndLoad();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminAndLoad = async () => {
    setIsLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth", { replace: true });
      return;
    }

    // Try to fetch requests - if successful, user is admin
    const { data, error } = await supabase
      .from("pro_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão de administrador.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
      return;
    }

    setIsAdmin(true);
    setRequests(data || []);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const handleRefresh = () => {
    checkAdminAndLoad();
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    setUpdatingId(id);
    
    const { error } = await supabase
      .from("pro_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } else {
      setRequests(prev => 
        prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
      );
      toast({
        title: "Status atualizado",
        description: `Pedido marcado como ${STATUS_CONFIG[newStatus].label.toLowerCase()}.`,
      });
    }
    
    setUpdatingId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
            <h1 className="editorial-headline text-2xl md:text-3xl">
              Painel Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {requests.length} pedido{requests.length !== 1 ? "s" : ""} Pro
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EditorialButton
              variant="secondary"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </EditorialButton>
            <EditorialButton
              variant="secondary"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </EditorialButton>
          </div>
        </div>

        <div className="editorial-divider mb-8" />

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhum pedido Pro ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status as Status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedId === request.id;
              const isUpdating = updatingId === request.id;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-sm overflow-hidden"
                >
                  {/* Header Row */}
                  <button
                    onClick={() => toggleExpand(request.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono text-sm font-semibold shrink-0">
                        {request.order_code}
                      </span>
                      <span className="text-sm truncate">
                        {request.name}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0",
                        statusConfig.className
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {format(new Date(request.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                      <ChevronDown 
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-4">
                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">E-mail</p>
                            <a 
                              href={`mailto:${request.email}`}
                              className="text-sm hover:underline inline-flex items-center gap-1"
                            >
                              {request.email}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                            <a 
                              href={`https://wa.me/${request.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm hover:underline inline-flex items-center gap-1"
                            >
                              {request.whatsapp}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Data</p>
                            <p className="text-sm">
                              {format(new Date(request.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {request.objective && (
                            <div className="col-span-2 sm:col-span-4">
                              <p className="text-xs text-muted-foreground mb-1">Objetivo</p>
                              <p className="text-sm">{request.objective}</p>
                            </div>
                          )}
                          {request.platform && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Plataforma</p>
                              <p className="text-sm">{request.platform}</p>
                            </div>
                          )}
                          {request.occasion && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Ocasião</p>
                              <p className="text-sm">{request.occasion}</p>
                            </div>
                          )}
                          {request.tone && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Tom</p>
                              <p className="text-sm">{request.tone}</p>
                            </div>
                          )}
                          {request.budget && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Orçamento</p>
                              <p className="text-sm">{request.budget}</p>
                            </div>
                          )}
                        </div>

                        {/* Reference Images */}
                        {request.reference_urls.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Referências</p>
                            <div className="flex gap-2 flex-wrap">
                              {request.reference_urls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-16 h-16 rounded-sm overflow-hidden border border-border hover:opacity-80 transition-opacity"
                                >
                                  <img 
                                    src={url} 
                                    alt={`Ref ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status Actions */}
                        <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                          <p className="text-xs text-muted-foreground w-full mb-1">Alterar status:</p>
                          {(Object.keys(STATUS_CONFIG) as Status[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(request.id, status)}
                              disabled={isUpdating || request.status === status}
                              className={cn(
                                "text-xs px-3 py-1.5 rounded-sm border transition-colors",
                                request.status === status
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border hover:border-foreground/50",
                                isUpdating && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {STATUS_CONFIG[status].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
