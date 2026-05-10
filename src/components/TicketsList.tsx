/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

type Ticket = {
  id: string;
  customer_name: string;
  subject: string;
  urgency: string;
  status: string;
  created_at: string;
};

export default function TicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Pin critical to top
      if (data) {
        const sorted = [...data].sort((a, b) => {
          if (a.urgency === "CRITICAL" && b.urgency !== "CRITICAL") return -1;
          if (b.urgency === "CRITICAL" && a.urgency !== "CRITICAL") return 1;
          return 0;
        });
        setTickets(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (tickets.length === 0) {
    return <div className="p-8 text-center text-slate-500">No tickets found.</div>;
  }

  return (
    <ul className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
      {tickets.map(ticket => {
        let borderClass = "border-l-slate-600";
        if (ticket.urgency === "CRITICAL") borderClass = "border-l-red-500";
        if (ticket.urgency === "NORMAL") borderClass = "border-l-yellow-500";

        return (
          <li key={ticket.id} className={`p-4 hover:bg-white/5 transition-colors flex items-start gap-4 border-l-4 ${borderClass}`}>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-white truncate tracking-wide">{ticket.subject}</p>
              <p className="text-sm text-slate-400 truncate mt-0.5 font-light">{ticket.customer_name}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {ticket.urgency === "CRITICAL" && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 ring-1 ring-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.2)]">CRITICAL</span>}
                {ticket.urgency === "NORMAL" && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.2)]">NORMAL</span>}
                {ticket.urgency === "LOW" && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 ring-1 ring-slate-700">LOW</span>}
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  ticket.status === 'auto_resolved' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-orange-500/20 bg-orange-500/10 text-orange-400'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 bg-black/30 px-2.5 py-1 rounded-full border border-white/5 font-light">
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
