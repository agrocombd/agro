"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";

const ROLES = ["customer", "retail_vendor", "b2b_vendor", "manager", "admin"];
const ROLE_BN = { customer: "ক্রেতা", retail_vendor: "বিক্রেতা", b2b_vendor: "পাইকারি বিক্রেতা", manager: "ম্যানেজার", admin: "অ্যাডমিন" };
const ROLE_COLORS = { customer: "bg-slate-100 text-slate-600", retail_vendor: "bg-blue-100 text-blue-600", b2b_vendor: "bg-indigo-100 text-indigo-600", manager: "bg-purple-100 text-purple-600", admin: "bg-green-100 text-green-700" };

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBan, setShowBan] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id,full_name,phone,avatar_url,role,created_at,is_banned")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast(error.message, "error");
    setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(userId, role) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) { toast(error.message, "error"); setSaving(false); return; }
    toast("ভূমিকা আপডেট হয়েছে", "success");
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    setSelectedUser(prev => prev ? { ...prev, role } : null);
    setSaving(false);
  }

  async function toggleBan(userId, isBanned) {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ is_banned: !isBanned }).eq("id", userId);
    if (error) { toast(error.message, "error"); return; }
    toast(!isBanned ? "ব্যবহারকারী ব্যান হয়েছে" : "ব্যান তুলে নেওয়া হয়েছে", "success");
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !isBanned } : u));
    setShowBan(null);
  }

  const filtered = users.filter(u => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search);
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">ব্যবহারকারী ব্যবস্থাপনা</h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1 flex-wrap border-b border-slate-200 dark:border-slate-700 flex-1">
          {[{ id: "all", label: "সব" }, ...ROLES.map(r => ({ id: r, label: ROLE_BN[r] }))].map(t => (
            <button key={t.id} onClick={() => setFilterRole(t.id)} className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${filterRole === t.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="নাম / ফোন..." className="input-base sm:w-48" />
      </div>

      <div className="text-xs text-slate-400">{filtered.length} জন ব্যবহারকারী</div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">ব্যবহারকারী</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">ফোন</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">ভূমিকা</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">যোগদান</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${user.is_banned ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                          {user.full_name?.[0] || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{user.full_name || "—"}</p>
                        {user.is_banned && <span className="text-[10px] font-semibold text-red-500">ব্যান</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{user.phone || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role] || "bg-slate-100 text-slate-500"}`}>
                      {ROLE_BN[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{timeAgo(user.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedUser(user); setNewRole(user.role); }} className="text-xs text-blue-600 hover:underline">সম্পাদনা</button>
                      <button onClick={() => setShowBan(user)} className={`text-xs hover:underline ${user.is_banned ? "text-green-600" : "text-red-500"}`}>
                        {user.is_banned ? "ব্যান তুলুন" : "ব্যান"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit role modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="ব্যবহারকারী সম্পাদনা" size="sm">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                {selectedUser.full_name?.[0] || "?"}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{selectedUser.full_name}</p>
                <p className="text-xs text-slate-400">{selectedUser.phone}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ভূমিকা পরিবর্তন করুন</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="input-base">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_BN[r]}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="secondary" onClick={() => setSelectedUser(null)} className="flex-1">বাতিল</Button>
              <Button onClick={() => updateRole(selectedUser.id, newRole)} loading={saving} className="flex-1" disabled={newRole === selectedUser.role}>সংরক্ষণ</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!showBan}
        onClose={() => setShowBan(null)}
        onConfirm={() => showBan && toggleBan(showBan.id, showBan.is_banned)}
        title={showBan?.is_banned ? "ব্যান তুলে নেবেন?" : "ব্যবহারকারী ব্যান করবেন?"}
        message={showBan?.is_banned ? `${showBan?.full_name} আবার লগইন করতে পারবেন।` : `${showBan?.full_name} আর লগইন করতে পারবেন না।`}
        confirmText={showBan?.is_banned ? "ব্যান তুলুন" : "ব্যান করুন"}
        confirmVariant={showBan?.is_banned ? "success" : "danger"}
      />
    </div>
  );
}
