/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { differenceInDays } from "date-fns";
import { Loader2, RefreshCw, Send } from "lucide-react";

type Invoice = {
  id: string;
  client_name: string;
  client_email: string;
  amount: number;
  due_date: string;
  status: string;
  reminder_count: number;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      if (data) setInvoices(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const runOverdueCheck = async () => {
    setRunningCheck(true);
    try {
      const res = await fetch("/api/invoices/check-overdue", { method: "POST" });
      const data = await res.json();
      if (data.reminders_sent !== undefined) {
        toast.success(`Sent ${data.reminders_sent} reminders successfully!`);
        fetchInvoices();
      } else {
        toast.error("Failed to run check");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error running overdue check");
    } finally {
      setRunningCheck(false);
    }
  };

  const resetTestData = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/invoices/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Test data reset!");
        fetchInvoices();
      } else {
        toast.error("Failed to reset");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resetting data");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Invoice Automation</h1>
          <p className="text-slate-400 mt-1">Live Demo Dashboard</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetTestData}
            disabled={resetting || loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-sm font-semibold rounded-lg text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition-all shadow-lg"
          >
            {resetting ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <RefreshCw className="w-4 h-4 text-emerald-400" />}
            Reset Test Data
          </button>
          <button
            onClick={runOverdueCheck}
            disabled={runningCheck || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {runningCheck ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Run Overdue Check
          </button>
        </div>
      </div>

      <div className="shadow-xl shadow-black/40 border border-white/10 backdrop-blur-sm bg-gray-900 overflow-hidden rounded-2xl relative z-10">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Days Overdue</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Reminders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invoices.map((invoice) => {
                  const today = new Date();
                  const due = new Date(invoice.due_date);
                  const isOverdue = today > due;
                  const daysOverdue = isOverdue ? differenceInDays(today, due) : 0;
                  
                  let overdueColor = 'text-slate-400';
                  if (isOverdue) {
                    if (daysOverdue >= 15) overdueColor = 'text-red-400';
                    else if (daysOverdue >= 8) overdueColor = 'text-orange-400';
                    else overdueColor = 'text-yellow-400';
                  }

                  return (
                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{invoice.client_name}</div>
                        <div className="text-sm text-slate-400">{invoice.client_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        ₹{invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {due.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOverdue ? (
                          <span className={`${overdueColor} font-bold text-sm`}>{daysOverdue} days</span>
                        ) : (
                          <span className="text-emerald-400 font-medium text-sm">Not overdue</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          invoice.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${invoice.reminder_count > 0 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700'}`}></span>
                          <span className={`w-2 h-2 rounded-full ${invoice.reminder_count > 1 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-slate-700'}`}></span>
                          <span className={`w-2 h-2 rounded-full ${invoice.reminder_count > 2 ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-slate-700'}`}></span>
                          <span className="ml-2 font-medium text-white">{invoice.reminder_count}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
