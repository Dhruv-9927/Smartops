"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import TicketsList from "@/components/TicketsList";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("We'll get back to you shortly");
        (e.target as HTMLFormElement).reset();
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to submit ticket.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1">
          <div className="p-6 sm:p-8 bg-gray-900 border border-white/10 shadow-2xl rounded-2xl relative z-10">
            <h2 className="text-xl font-bold text-white mb-6 tracking-wide">Submit a Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                <input required type="text" name="customer_name" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input required type="email" name="customer_email" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                <input required type="text" name="subject" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" placeholder="Help with billing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                <textarea required name="message" rows={5} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" placeholder="Describe your issue..."></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold w-full py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center disabled:opacity-70 mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Ticket"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl shadow-sm overflow-hidden backdrop-blur-sm relative z-10">
            <div className="px-6 py-5 border-b border-white/10 bg-black/20">
              <h2 className="text-xl font-bold text-white tracking-wide">Recent Tickets</h2>
            </div>
            <TicketsList key={refreshKey} />
          </div>
        </div>

      </div>
    </div>
  );
}
