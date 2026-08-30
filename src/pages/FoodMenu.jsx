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
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Culinary <span className="text-primary">Planner</span>
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Daily food schedule and nutrition chart.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {days.map((day) => {
                    const dayData = menu.find(m => m.day === day)?.menu || { breakfast: '-', lunch: '-', dinner: '-' };
                    const isEditing = editing === day;

                    return (
                        <div key={day} className="card-3d rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col">
                            <div className="bg-app px-5 py-4 border-b border-border flex items-center justify-between">
                                <h4 className="text-sm font-bold text-main uppercase tracking-wider">{day}</h4>
                                {isAdmin && !isEditing && (
                                    <button
                                        onClick={() => {
                                            setEditing(day);
                                            setEditForm(dayData);
                                        }}
                                        className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="p-5 space-y-5 flex-1">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-warning font-bold text-[10px] uppercase tracking-wider">
                                        <Coffee className="w-4 h-4" /> Breakfast
                                    </div>
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-app border border-border rounded-xl p-3 text-main text-sm font-medium focus:border-warning focus:ring-2 focus:ring-warning/20 outline-none transition-all"
                                            value={editForm.breakfast}
                                            onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-main text-sm font-semibold tracking-tight leading-relaxed">{dayData.breakfast}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-wider">
                                        <Sun className="w-4 h-4" /> Lunch
                                    </div>
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-app border border-border rounded-xl p-3 text-main text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            value={editForm.lunch}
                                            onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-main text-sm font-semibold tracking-tight leading-relaxed">{dayData.lunch}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-wider">
                                        <Moon className="w-4 h-4" /> Dinner
                                    </div>
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-app border border-border rounded-xl p-3 text-main text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            value={editForm.dinner}
                                            onChange={(e) => setEditForm({ ...editForm, dinner: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-main text-sm font-semibold tracking-tight leading-relaxed">{dayData.dinner}</p>
                                    )}
                                </div>
                            </div>
                            {isEditing && (
                                <div className="flex gap-3 p-5 pt-0 mt-auto border-t border-border/50">
                                    <button onClick={() => setEditing(null)} className="flex-1 py-2.5 text-muted hover:text-main font-medium border border-border hover:bg-border rounded-xl transition-colors">Cancel</button>
                                    <button onClick={() => handleUpdate(day)} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">Save</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {loading && (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            )}
        </div>
    );
};

export default FoodMenu;
