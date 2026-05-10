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
          <h1 className="text-2xl font-bold text-slate-900">Invoice Automation</h1>
          <p className="text-slate-500 mt-1">Live Demo Dashboard</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetTestData}
            disabled={resetting || loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Reset Test Data
          </button>
          <button
            onClick={runOverdueCheck}
            disabled={runningCheck || loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
          >
            {runningCheck ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Run Overdue Check
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days Overdue</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reminders</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {invoices.map((invoice) => {
                  const today = new Date();
                  const due = new Date(invoice.due_date);
                  const isOverdue = today > due;
                  const daysOverdue = isOverdue ? differenceInDays(today, due) : 0;

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{invoice.client_name}</div>
                        <div className="text-sm text-slate-500">{invoice.client_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        ₹{invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {due.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOverdue ? (
                          <span className="text-red-600 font-medium text-sm">{daysOverdue} days</span>
                        ) : (
                          <span className="text-emerald-600 font-medium text-sm">Not overdue</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${invoice.reminder_count > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
                          <span className={`w-2 h-2 rounded-full ${invoice.reminder_count > 1 ? 'bg-yellow-500' : 'bg-slate-200'}`}></span>
                          <span className={`w-2 h-2 rounded-full ${invoice.reminder_count > 2 ? 'bg-red-500' : 'bg-slate-200'}`}></span>
                          <span className="ml-2 font-medium">{invoice.reminder_count}</span>
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
