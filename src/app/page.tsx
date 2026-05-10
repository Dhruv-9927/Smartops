/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, PlayCircle, Activity, CheckCircle2, AlertCircle, Send, Users, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

type Stats = {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  total_tickets: number;
  critical_tickets: number;
  auto_resolved_tickets: number;
  total_invoices: number;
  overdue_invoices: number;
  reminders_sent: number;
  recent_activity: {
    id: string;
    type: string;
    label: string;
    badge: string;
    created_at: string;
  }[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Avoid calling setState synchronously by calling fetchStats in the next tick
    setTimeout(fetchStats, 0);
    const interval = setInterval(fetchStats, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, []);

  const runDemoMode = async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    toast("Starting Demo Mode...", { icon: '🚀' });

    try {
      // 1. Submit Lead
      toast("1/3 Submitting test lead...");
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ratan Tata",
          email: "ratan@tata.com",
          company: "Tata Consultancy",
          budget: "₹50k+",
          problem: "We need to automate our sales pipeline across multiple departments."
        })
      });
      await fetchStats();

      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Submit Ticket
      toast("2/3 Submitting test ticket...");
      await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: "Jane Smith",
          customer_email: "jane@example.com",
          subject: "My invoice download is broken",
          message: "When I click the PDF link on my latest invoice, it gives a 404 error. Please help!"
        })
      });
      await fetchStats();

      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Overdue Check
      toast("3/3 Running overdue invoices check...");
      await fetch("/api/invoices/check-overdue", { method: "POST" });
      await fetchStats();

      toast.success("Demo sequence completed!");

    } catch (err) {
      console.error(err);
      toast.error("Demo failed");
    } finally {
      setDemoRunning(false);
    }
  };

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Hero Section */}
      <div className="text-center mb-16 pt-8 relative">
        <h1 className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent text-6xl font-black mb-6 leading-tight">
          Your business <br className="hidden md:block"/> runs itself
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light">
          AI-powered lead scoring, support triage, and invoice automation — 24/7.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={runDemoMode}
            disabled={demoRunning}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {demoRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
            {demoRunning ? "Running Demo..." : "Run Demo Mode"}
          </button>
        </div>
      </div>

      {/* Stats Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        
        {/* Leads */}
        <div className="shadow-xl shadow-black/40 border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-2xl group hover:-translate-y-2 transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl ring-1 ring-blue-500/30 group-hover:scale-110 transition-transform"><Users className="w-6 h-6" /></div>
            <h2 className="text-xl font-semibold text-white tracking-wide">Lead Engine</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total</p>
              <p className="text-5xl font-bold text-white mt-2">{stats.total_leads}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium relative z-10">Hot Leads</p>
              <p className="text-5xl font-bold text-emerald-400 mt-2 relative z-10">{stats.hot_leads}</p>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="shadow-xl shadow-black/40 border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-2xl group hover:-translate-y-2 transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl ring-1 ring-amber-500/30 group-hover:scale-110 transition-transform"><AlertCircle className="w-6 h-6" /></div>
            <h2 className="text-xl font-semibold text-white tracking-wide">Support Triage</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 font-medium relative z-10">Resolved</p>
              <p className="text-5xl font-bold text-white mt-2 relative z-10">{stats.auto_resolved_tickets}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium relative z-10">Critical</p>
              <p className="text-5xl font-bold text-red-400 mt-2 relative z-10">{stats.critical_tickets}</p>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="shadow-xl shadow-black/40 border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-2xl group hover:-translate-y-2 transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl ring-1 ring-emerald-500/30 group-hover:scale-110 transition-transform"><Send className="w-6 h-6" /></div>
            <h2 className="text-xl font-semibold text-white tracking-wide">Invoice Auto</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 font-medium relative z-10">Overdue</p>
              <p className="text-5xl font-bold text-orange-400 mt-2 relative z-10">{stats.overdue_invoices}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium relative z-10">Reminders</p>
              <p className="text-5xl font-bold text-emerald-400 mt-2 relative z-10">{stats.reminders_sent}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Feed */}
      <div className="shadow-xl shadow-black/40 border border-white/10 backdrop-blur-sm bg-white/5 overflow-hidden rounded-2xl">
        <div className="px-8 py-6 border-b border-white/10 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white tracking-wide">Live Activity Feed</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
            <span className="bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] rounded-full w-2 h-2 animate-pulse"></span>
            Auto-refreshing
          </div>
        </div>
        <ul className="divide-y divide-white/10 max-h-[400px] overflow-y-auto p-2">
          {stats.recent_activity.map(activity => {
            const isInvoice = activity.type === 'invoice';
            const isLead = activity.type === 'lead';
            const isTicket = activity.type === 'ticket';
            
            return (
              <li key={activity.id} className="p-4 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-5 my-1 border-l-2 border-emerald-500/30 pl-4">
                <div className="shrink-0">
                  {isInvoice && <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>}
                  {isLead && <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-pulse"></div>}
                  {isTicket && <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse"></div>}
                  {!isInvoice && !isLead && !isTicket && <div className="w-3 h-3 rounded-full bg-slate-400"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-slate-200">{activity.label}</p>
                  <p className="text-sm text-slate-400 capitalize mt-0.5 font-light">{activity.type}</p>
                </div>
                <div className="shrink-0 text-sm text-slate-500 font-light bg-black/30 px-3 py-1 rounded-full border border-white/10">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </div>
              </li>
            );
          })}
          {stats.recent_activity.length === 0 && (
            <li className="p-12 text-center text-slate-500 font-light text-lg">Waiting for incoming events...</li>
          )}
        </ul>
      </div>

    </div>
  );
}
