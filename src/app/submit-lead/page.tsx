"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function SubmitLeadPage() {
  const [loading, setLoading] = useState(false);
  const [successScore, setSuccessScore] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessScore(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Lead submitted successfully!");
        setSuccessScore(result.score);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error("Failed to submit lead.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Partner with SmartOps</h1>
        <p className="text-slate-500">Fill out the form below and our AI will qualify your request instantly.</p>
      </div>

      {successScore && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          <p className="font-medium">Success! Our AI scored your lead as: <span className="font-bold">{successScore}</span></p>
          <p className="text-sm mt-1">Check your email for a personalized response.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input required type="text" name="name" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="Jane Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
          <input required type="email" name="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="jane@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
          <input required type="text" name="company" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="Acme Corp" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Budget</label>
          <select required name="budget" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors">
            <option value="Under ₹10k">Under ₹10k</option>
            <option value="₹10k–50k">₹10k–50k</option>
            <option value="₹50k+">₹50k+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Describe your main problem</label>
          <textarea required name="problem" rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="We are struggling to automate our..."></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
