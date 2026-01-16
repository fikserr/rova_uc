import AdminLayout from '@/Components/Layout/AdminLayout'
import React from 'react'
export default function Dashboard() {
  return <div>Welcome to Admin Dashboard</div>
}

Dashboard.layout = page => <AdminLayout>{page}</AdminLayout>
