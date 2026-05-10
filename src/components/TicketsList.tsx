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
    <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
      {tickets.map(ticket => (
        <li key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{ticket.subject}</p>
            <p className="text-sm text-slate-500 truncate">{ticket.customer_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {ticket.urgency === "CRITICAL" && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">CRITICAL</span>}
              {ticket.urgency === "NORMAL" && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">NORMAL</span>}
              {ticket.urgency === "LOW" && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">LOW</span>}
              
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                ticket.status === 'auto_resolved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
