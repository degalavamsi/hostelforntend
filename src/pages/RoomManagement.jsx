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
        if (pct >= 1) return 'bg-danger';
        if (pct >= 0.7) return 'bg-warning';
        return 'bg-success';
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">
                        Hostel <span className="text-primary">Rooms</span>
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">
                        {isAdmin ? 'Manage occupancy and bed allocations.' : 'Browse available rooms.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddRoom(true)}
                        className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" /> Add Room
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.length === 0 && (
                        <div className="col-span-3 p-10 text-center text-muted">
                            <Home className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No rooms found</p>
                        </div>
                    )}
                    {rooms.map((room) => (
                        <div key={room._id} className="card-3d rounded-2xl p-5 hover:shadow-floating hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-app rounded-xl text-muted group-hover:text-primary transition-colors">
                                    <Home className="w-5 h-5" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${(room.available_beds ?? room.capacity) > 0 ? 'bg-success/10 text-success'
                                        : 'bg-danger/10 text-danger'
                                        }`}>
                                        {(room.available_beds ?? room.capacity) > 0
                                            ? `${room.available_beds ?? room.capacity} Free`
                                            : 'Full'}
                                    </span>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteRoom(room._id)}
                                            className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-main tracking-tight">Room {room.room_number || room.number}</h4>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleEditRoomClick(room)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-white hover:bg-primary px-2.5 py-1 rounded-md bg-primary/10 transition-colors"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-muted text-xs mb-5 pb-5 border-b border-border font-medium">
                                <span className="flex items-center gap-1.5"><DoorOpen className="w-3.5 h-3.5" /> Floor {room.floor}</span>
                                <span className="uppercase tracking-wider">{room.room_type || room.type}</span>
                                {room.ac && <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">AC</span>}
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-muted uppercase tracking-wider">Occupancy</span>
                                    <span className="text-main font-semibold">{room.occupied_beds || 0}/{room.capacity}</span>
                                </div>
                                <div className="w-full bg-app h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${occupancyColor(room)}`}
                                        style={{ width: `${((room.occupied_beds || 0) / (room.capacity || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => handleManageBedsClick(room)}
                                    className="w-full mt-6 py-2.5 bg-app hover:bg-border text-main font-semibold text-xs rounded-xl transition-all border border-border flex items-center justify-center gap-2"
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
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="card-3d w-full max-w-lg rounded-2xl p-8 relative">
                        <button onClick={() => setShowEditRoom(false)} className="absolute top-6 right-6 text-muted hover:text-main transition-colors bg-app p-2 rounded-xl">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-semibold text-main mb-6 tracking-tight">Edit <span className="text-primary">Room</span></h2>
                        <form onSubmit={handleUpdateRoom} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Room Number</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                        value={editRoomData.number}
                                        onChange={(e) => setEditRoomData({ ...editRoomData, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Floor</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                        value={editRoomData.floor}
                                        onChange={(e) => setEditRoomData({ ...editRoomData, floor: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Capacity</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                        value={editRoomData.capacity}
                                        onChange={(e) => setEditRoomData({ ...editRoomData, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Type</label>
                                    <select
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
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
                            <label className="flex items-center gap-3 cursor-pointer ml-1">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-primary rounded border-border"
                                    checked={editRoomData.ac}
                                    onChange={(e) => setEditRoomData({ ...editRoomData, ac: e.target.checked })}
                                />
                                <span className="text-main font-medium text-sm tracking-tight">AC Room</span>
                            </label>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={() => setShowEditRoom(false)} type="button" className="flex-1 py-2.5 text-muted font-medium hover:text-main hover:bg-border transition-colors border border-border rounded-xl bg-app">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-primary hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/20">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Beds Modal */}
            {showManageBeds && selectedRoom && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="card-3d w-full max-w-2xl rounded-2xl overflow-hidden relative flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-border bg-app flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-2xl font-semibold text-main tracking-tight">Room <span className="text-primary">{selectedRoom.room_number || selectedRoom.number}</span> Details</h2>
                                <p className="text-muted mt-1 text-xs font-medium uppercase tracking-wider">{roomBeds.length} / {selectedRoom.capacity} Beds Occupied</p>
                            </div>
                            <button onClick={() => setShowManageBeds(false)} className="text-muted hover:text-main transition-colors hover:bg-border p-2 rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar space-y-4">
                            {roomBeds.length === 0 ? (
                                <div className="text-center py-10">
                                    <Bed className="w-12 h-12 text-muted mx-auto mb-3 opacity-30" />
                                    <p className="text-muted font-medium text-sm">Room is completely empty</p>
                                </div>
                            ) : (
                                roomBeds.map(bed => (
                                    <div key={bed._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-app border border-border rounded-xl hover:border-primary/30 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                {bed.bed_number}
                                            </div>
                                            <div>
                                                <p className="text-main font-semibold text-sm">{bed.student_name}</p>
                                                <p className="text-muted text-[10px] uppercase tracking-wider font-medium mt-0.5">Status: {bed.status}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBed(bed._id)}
                                            className="px-4 py-2 bg-danger/10 text-danger font-medium rounded-lg hover:bg-danger hover:text-white transition-all text-xs"
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
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="card-3d w-full max-w-lg rounded-2xl p-8 relative">
                        <button onClick={() => setShowAddRoom(false)} className="absolute top-6 right-6 text-muted hover:text-main transition-colors bg-app p-2 rounded-xl">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-semibold text-main mb-6 tracking-tight">New <span className="text-primary">Room</span></h2>
                        <form onSubmit={handleAddRoom} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Room Number</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                        placeholder="e.g. 101"
                                        onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Floor</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                        defaultValue={1}
                                        onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Capacity</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                        defaultValue={4}
                                        onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Type</label>
                                    <select
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                        onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                                    >
                                        <option>2 share</option>
                                        <option>3 share</option>
                                        <option>4 share</option>
                                        <option>single</option>
                                    </select>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer ml-1">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-primary rounded border-border"
                                    onChange={(e) => setNewRoom({ ...newRoom, ac: e.target.checked })}
                                />
                                <span className="text-main font-medium text-sm tracking-tight">AC Room</span>
                            </label>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddRoom(false)}
                                    className="flex-1 py-2.5 text-muted font-medium hover:text-main hover:bg-border transition-colors border border-border rounded-xl bg-app"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/20"
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
