import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import {
    DoorOpen, Plus, Search,
    Bed, Home, ClipboardList, Loader2, X, Trash2
} from 'lucide-react';

const RoomManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [showEditRoom, setShowEditRoom] = useState(false);
    const [showManageBeds, setShowManageBeds] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomBeds, setRoomBeds] = useState([]);

    const [newRoom, setNewRoom] = useState({
        number: '',
        floor: 1,
        capacity: 4,
        type: '3 share',
        ac: false
    });
    const [editRoomData, setEditRoomData] = useState({});

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/rooms', {
                ...newRoom,
                room_number: newRoom.number,
                room_type: newRoom.type
            });
            fetchRooms();
            setShowAddRoom(false);
        } catch (err) {
            alert('Failed to add room');
        }
    };

    const handleDeleteRoom = async (id) => {
        if (!window.confirm('Delete this room?')) return;
        try {
            await api.delete(`/rooms/${id}`);
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to delete room');
        }
    };

    const handleEditRoomClick = (room) => {
        setSelectedRoom(room);
        setEditRoomData({
            number: room.room_number || room.number,
            floor: room.floor,
            capacity: room.capacity,
            type: room.room_type || room.type,
            ac: room.ac || false
        });
        setShowEditRoom(true);
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/rooms/${selectedRoom._id}`, editRoomData);
            fetchRooms();
            setShowEditRoom(false);
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to update room');
        }
    };

    const handleManageBedsClick = async (room) => {
        setSelectedRoom(room);
        try {
            const res = await api.get(`/rooms/${room._id}/beds`);
            setRoomBeds(res.data);
            setShowManageBeds(true);
        } catch (err) {
            alert('Failed to load beds for this room');
        }
    };

    const handleRemoveBed = async (bedId) => {
        if (!window.confirm('Unassign this student from the room?')) return;
        try {
            await api.delete(`/rooms/${selectedRoom._id}/beds/${bedId}`);
            // Refresh bed list and rooms
            const res = await api.get(`/rooms/${selectedRoom._id}/beds`);
            setRoomBeds(res.data);
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to remove bed assignment');
        }
    };

    const occupancyColor = (room) => {
        const pct = (room.occupied_beds || 0) / (room.capacity || 1);
        if (pct >= 1) return 'bg-red-500';
        if (pct >= 0.7) return 'bg-amber-500';
        return 'bg-green-500';
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">
                        Hostel <span className="text-primary-500">Rooms</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-medium tracking-tight">
                        {isAdmin ? 'Manage occupancy and bed allocations.' : 'Browse available rooms.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddRoom(true)}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 uppercase tracking-tight"
                    >
                        <Plus className="w-4 h-4" /> Add Room
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.length === 0 && (
                        <div className="col-span-3 p-10 text-center text-slate-600">
                            <Home className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="font-black uppercase tracking-tight text-[10px]">No rooms found</p>
                        </div>
                    )}
                    {rooms.map((room) => (
                        <div key={room._id} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 group hover:border-primary-500/50 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/5 blur-[30px] group-hover:bg-primary-500/10 transition-all"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-slate-800 rounded-xl group-hover:bg-primary-500/10 transition-colors">
                                    <Home className="w-5 h-5 text-slate-400 group-hover:text-primary-400" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight border ${(room.available_beds ?? room.capacity) > 0
                                        ? 'bg-green-500/10 text-green-400 border-green-500/10'
                                        : 'bg-red-500/10 text-red-400 border-red-500/10'
                                        }`}>
                                        {(room.available_beds ?? room.capacity) > 0
                                            ? `${room.available_beds ?? room.capacity} Free`
                                            : 'Full'}
                                    </span>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteRoom(room._id)}
                                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-lg font-black text-white tracking-tight">Room {room.room_number || room.number}</h4>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleEditRoomClick(room)}
                                        className="text-[8px] font-black uppercase tracking-tight text-blue-400 hover:text-white hover:bg-blue-500 px-2 py-0.5 rounded-lg bg-blue-500/10 transition-colors"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-[10px] mb-4 pb-4 border-b border-slate-800 font-medium tracking-tight">
                                <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> Floor {room.floor}</span>
                                <span className="font-black uppercase text-[8px] tracking-tight">{room.room_type || room.type}</span>
                                {room.ac && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[8px] font-black uppercase tracking-tight">AC</span>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-500 font-black uppercase tracking-tight">Occupancy</span>
                                    <span className="text-slate-100 font-black">{room.occupied_beds || 0}/{room.capacity}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${occupancyColor(room)}`}
                                        style={{ width: `${((room.occupied_beds || 0) / (room.capacity || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => handleManageBedsClick(room)}
                                    className="w-full mt-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2"
                                >
                                    <ClipboardList className="w-4 h-4" /> Manage Beds
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Room Modal */}
            {showEditRoom && selectedRoom && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-[32px] p-10 shadow-2xl relative">
                        <button onClick={() => setShowEditRoom(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-3xl font-black text-white mb-8">Edit <span className="text-blue-500">Room</span></h2>
                        <form onSubmit={handleUpdateRoom} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Room Number</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors"
                                        value={editRoomData.number}
                                        onChange={(e) => setEditRoomData({ ...editRoomData, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Floor</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors"
                                        value={editRoomData.floor}
                                        onChange={(e) => setEditRoomData({ ...editRoomData, floor: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Capacity</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors"
                                        value={editRoomData.capacity}
                                        onChange={(e) => setEditRoomData({ ...editRoomData, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Type</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors"
                                        value={editRoomData.type}
                                        onChange={(e) => setEditRoomData({ ...editRoomData, type: e.target.value })}
                                    >
                                        <option>2 share</option>
                                        <option>3 share</option>
                                        <option>4 share</option>
                                        <option>single</option>
                                    </select>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-blue-500"
                                    checked={editRoomData.ac}
                                    onChange={(e) => setEditRoomData({ ...editRoomData, ac: e.target.checked })}
                                />
                                <span className="text-slate-300 font-bold">AC Room</span>
                            </label>
                            <div className="flex items-center gap-4 pt-2">
                                <button onClick={() => setShowEditRoom(false)} type="button" className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors border border-slate-800 rounded-2xl">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Beds Modal */}
            {showManageBeds && selectedRoom && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]">
                        <div className="p-8 border-b border-slate-800 bg-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-3xl font-black text-white">Room <span className="text-indigo-400">{selectedRoom.room_number || selectedRoom.number}</span> Details</h2>
                                <p className="text-slate-400 mt-1 font-medium">{roomBeds.length} / {selectedRoom.capacity} Beds Occupied</p>
                            </div>
                            <button onClick={() => setShowManageBeds(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 custom-scrollbar space-y-4">
                            {roomBeds.length === 0 ? (
                                <div className="text-center py-10">
                                    <Bed className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">Room is completely empty</p>
                                </div>
                            ) : (
                                roomBeds.map(bed => (
                                    <div key={bed._id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-lg">
                                                {bed.bed_number}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-lg">{bed.student_name}</p>
                                                <p className="text-slate-500 text-xs uppercase tracking-widest font-black mt-1">Status: {bed.status}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBed(bed._id)}
                                            className="px-6 py-2 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                                        >
                                            Unassign Student
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Room Modal - Admin only */}
            {showAddRoom && isAdmin && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-[32px] p-10 shadow-2xl relative">
                        <button onClick={() => setShowAddRoom(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-3xl font-black text-white mb-8">New Room</h2>
                        <form onSubmit={handleAddRoom} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Room Number</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                        placeholder="e.g. 101"
                                        onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Floor</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                        defaultValue={1}
                                        onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Capacity</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                        defaultValue={4}
                                        onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Type</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                        onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                                    >
                                        <option>2 share</option>
                                        <option>3 share</option>
                                        <option>4 share</option>
                                        <option>single</option>
                                    </select>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-primary-500"
                                    onChange={(e) => setNewRoom({ ...newRoom, ac: e.target.checked })}
                                />
                                <span className="text-slate-300 font-bold">AC Room</span>
                            </label>
                            <div className="flex items-center gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddRoom(false)}
                                    className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors border border-slate-800 rounded-2xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-600/20"
                                >
                                    Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
