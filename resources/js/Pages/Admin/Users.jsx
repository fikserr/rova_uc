import React from 'react'
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Components/Layout/AdminLayout";

function Users({ users }) {
  return (
    <>
      <Head title="Users" />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Foydalanuvchilar</h1>

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Telegram ID</th>
                <th className="border px-3 py-2">Username</th>
                <th className="border px-3 py-2">Telefon</th>
                <th className="border px-3 py-2">Balance</th>
                <th className="border px-3 py-2">Role</th>
                <th className="border px-3 py-2">Sana</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{user.id}</td>
                  <td className="border px-3 py-2">
                    {user.username ?? "-"}
                  </td>
                  <td className="border px-3 py-2">
                    {user.phone_number ?? "Yo‘q"}
                  </td>
                  <td className="border px-3 py-2 font-semibold">
                    {user.balance}
                  </td>
                  <td className="border px-3 py-2">{user.role}</td>
                  <td className="border px-3 py-2">{user.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
Users.layout = (page) => <AdminLayout>{page}</AdminLayout>;
export default Users
