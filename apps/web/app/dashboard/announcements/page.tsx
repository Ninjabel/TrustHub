export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
          <p className="mt-2 text-sm text-gray-700">
            View system announcements and updates
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Announcements
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Announcements with read tracking will be displayed here
          </div>
        </div>
      </div>
    </div>
  )
}
