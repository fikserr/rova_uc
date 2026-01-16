import React from 'react'
import AdminLayout from "@/Components/Layout/AdminLayout";

function Users() {
  return (
    <div>Users</div>
  )
}
Users.layout = (page) => <AdminLayout>{page}</AdminLayout>;
export default Users
