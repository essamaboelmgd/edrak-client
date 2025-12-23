export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-2">Active Courses</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">$45,200</p>
        </div>
      </div>
    </div>
  )
}
