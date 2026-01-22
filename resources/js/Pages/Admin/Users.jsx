import AdminLayout from "@/Components/Layout/AdminLayout";
import { Head } from "@inertiajs/react";
import { Ban, Eye, Search } from "lucide-react";
import { useState } from "react";
function Users({ users }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);

    const handleToggleActive = (userId) => {
        setUsers(
            users.map((user) =>
                user.id === userId
                    ? { ...user, isActive: !user.isActive }
                    : user,
            ),
        );
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone_number.includes(searchTerm),
    );
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Head>
                <title>Users Management</title>
                <meta name="description" content="Your page description" />
            </Head>
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Users Management
                </h2>
                <p className="text-gray-500 mt-1">
                    Manage your customers and their accounts
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl sm:text-xl md:text-2xl font-bold text-gray-900 mt-1">
                        {users.length}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Active Users</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">
                        {users.filter((u) => u.isActive).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Total Balance (UZS)</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
                        {users.reduce((sum, u) => sum + u.balance, 0)}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Total Spent (UZS)</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">
                        0
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Username or Phone Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance (UZS)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orders
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Spent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Join Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.phone_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.balance}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.totalOrders}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        0 UZS
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {user.isActive
                                                ? "Active"
                                                : "Blocked"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleToggleActive(user.id)
                                                }
                                                className={
                                                    user.isActive
                                                        ? "text-red-600 hover:text-red-800"
                                                        : "text-green-600 hover:text-green-800"
                                                }
                                                title={
                                                    user.isActive
                                                        ? "Block User"
                                                        : "Unblock User"
                                                }
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Users Cards (Mobile) */}
            <div className="md:hidden space-y-3">
                {filteredUsers.map((user) => {
                    const isExpanded = expandedUserId === user.id;

                    return (
                        <div
                            key={user.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            {/* HEADER (always visible / clickable) */}
                            <button
                                onClick={() =>
                                    setExpandedUserId(
                                        isExpanded ? null : user.id,
                                    )
                                }
                                className="w-full text-left p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900 leading-tight">
                                        {user.username}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user.phone_number}
                                    </p>
                                </div>

                                <span
                                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        user.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {user.isActive ? "Active" : "Blocked"}
                                </span>
                            </button>

                            {/* EXPANDABLE CONTENT */}
                            {isExpanded && (
                                <div className="px-4 pb-4">
                                    <div className="border-t border-gray-100 my-3" />

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs">
                                                Balance
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {user.balance} UZS
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 text-xs">
                                                Orders
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {user.totalOrders}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 text-xs">
                                                User ID
                                            </p>
                                            <p className="font-mono text-gray-900 text-xs">
                                                #{user.id}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 text-xs">
                                                Joined
                                            </p>
                                            <p className="text-gray-900 text-xs">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-4 mt-4 pt-3 border-t">
                                        <button
                                            className="text-blue-600 hover:text-blue-800"
                                            title="View Details"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleToggleActive(user.id)
                                            }
                                            className={
                                                user.isActive
                                                    ? "text-red-600 hover:text-red-800"
                                                    : "text-green-600 hover:text-green-800"
                                            }
                                            title={
                                                user.isActive
                                                    ? "Block User"
                                                    : "Unblock User"
                                            }
                                        >
                                            <Ban className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                            User Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">User ID</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedUser.id}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Username
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedUser.username}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Phone Number
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedUser.phoneNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedUser.role}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Balance</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedUser.balance} UZS
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Orders
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedUser.totalOrders}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Spent
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    0 UZS
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Join Date
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedUser.createdAt}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
Users.layout = (page) => <AdminLayout>{page}</AdminLayout>;
export default Users;
