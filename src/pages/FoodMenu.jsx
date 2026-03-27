import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Utensils, Edit3, Save, X, Coffee, Sun, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const FoodMenu = () => {
    const { user } = useAuth();
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // day
    const [editForm, setEditForm] = useState({ breakfast: '', lunch: '', dinner: '' });

    const fetchMenu = async () => {
        try {
            const res = await api.get('/notices/menu');
            setMenu(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleUpdate = async (day) => {
        try {
            await api.post('/notices/menu', { day, menu: editForm });
            setEditing(null);
            fetchMenu();
        } catch (err) {
            alert('Update failed');
        }
    };

    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Culinary <span className="text-primary-500">Planner</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-medium tracking-tight">Daily food schedule and nutrition chart.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {days.map((day) => {
                    const dayData = menu.find(m => m.day === day)?.menu || { breakfast: '-', lunch: '-', dinner: '-' };
                    const isEditing = editing === day;

                    return (
                        <div key={day} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-primary-500/50 transition-all duration-300">
                            <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{day}</h4>
                                {isAdmin && !isEditing && (
                                    <button
                                        onClick={() => {
                                            setEditing(day);
                                            setEditForm(dayData);
                                        }}
                                        className="p-1.5 text-slate-500 hover:text-primary-400 transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-amber-500 font-black text-[9px] uppercase tracking-tight">
                                        <Coffee className="w-3.5 h-3.5" /> Breakfast
                                    </div>
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-slate-800 border-none rounded-lg p-2 text-white text-xs"
                                            value={editForm.breakfast}
                                            onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-slate-200 text-sm font-bold tracking-tight">{dayData.breakfast}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-blue-500 font-black text-[9px] uppercase tracking-widest">
                                        <Sun className="w-3.5 h-3.5" /> Lunch
                                    </div>
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-slate-800 border-none rounded-lg p-2 text-white text-xs"
                                            value={editForm.lunch}
                                            onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-slate-200 text-sm font-bold tracking-tight">{dayData.lunch}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-500 font-black text-[9px] uppercase tracking-widest">
                                        <Moon className="w-3.5 h-3.5" /> Dinner
                                    </div>
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-slate-800 border-none rounded-lg p-2 text-white text-xs"
                                            value={editForm.dinner}
                                            onChange={(e) => setEditForm({ ...editForm, dinner: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-slate-200 text-sm font-bold tracking-tight">{dayData.dinner}</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2 pt-3 border-t border-white/5">
                                        <button onClick={() => setEditing(null)} className="flex-1 py-2 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                                        <button onClick={() => handleUpdate(day)} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary-900/10">Save</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {loading && (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            )}
        </div>
    );
};

export default FoodMenu;
