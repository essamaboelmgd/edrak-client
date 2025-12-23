import { useSubdomain } from '@/hooks/useSubdomain';

export default function TeacherSite() {
  const subdomain = useSubdomain();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Header */}
      <div className="h-64 bg-slate-900 flex items-center justify-center text-white">
         <h1 className="text-5xl font-bold">{subdomain}'s Academy</h1>
      </div>
      
      <div className="container mx-auto py-12 px-4">
        <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">Course Title {i}</h3>
                        <p className="text-sm text-gray-500">Learn the best skills efficiently.</p>
                        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Enroll Now</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
