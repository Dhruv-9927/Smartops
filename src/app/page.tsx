"use client";

import { useEffect, useState } from "next";
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
    fetchStats();
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
      <div className="text-center mb-16 pt-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          Your business runs itself
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          AI-powered lead scoring, support triage, and invoice automation — 24/7.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={runDemoMode}
            disabled={demoRunning}
            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-70"
          >
            {demoRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
            {demoRunning ? "Running Demo..." : "Run Demo Mode"}
          </button>
        </div>
      </div>

      {/* Stats Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        {/* Leads */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></div>
            <h2 className="text-lg font-semibold text-slate-900">Lead Engine</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Total</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total_leads}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Hot Leads</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.hot_leads}</p>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
            <h2 className="text-lg font-semibold text-slate-900">Support Triage</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.auto_resolved_tickets}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Critical</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.critical_tickets}</p>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Send className="w-5 h-5" /></div>
            <h2 className="text-lg font-semibold text-slate-900">Invoice Automation</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.overdue_invoices}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Reminders</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.reminders_sent}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Live Activity Feed</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="bg-emerald-500 rounded-full w-2 h-2 animate-pulse"></span>
            Auto-refreshing
          </div>
        </div>
        <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
          {stats.recent_activity.map(activity => (
            <li key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
              <div className="shrink-0 mt-0.5">
                {activity.badge === 'red' && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
                {activity.badge === 'yellow' && <div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
                {activity.badge === 'gray' && <div className="w-3 h-3 rounded-full bg-slate-400"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{activity.label}</p>
                <p className="text-xs text-slate-500 capitalize">{activity.type}</p>
              </div>
              <div className="shrink-0 text-xs text-slate-400">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </li>
          ))}
          {stats.recent_activity.length === 0 && (
            <li className="p-8 text-center text-slate-500">No recent activity.</li>
          )}
        </ul>
      </div>

    </div>
  );
}
