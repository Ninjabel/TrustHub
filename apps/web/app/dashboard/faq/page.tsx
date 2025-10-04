export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">FAQ</h1>
          <p className="mt-2 text-sm text-gray-700">
            Frequently asked questions and answers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <input
            type="search"
            placeholder="Search FAQs..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Questions & Answers
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500">
            FAQ items with ratings and categories will be displayed here
          </div>
        </div>
      </div>
    </div>
  )
}
