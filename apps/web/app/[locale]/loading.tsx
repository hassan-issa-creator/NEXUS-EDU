export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                {/* Logo Pulse */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 animate-pulse flex items-center justify-center shadow-xl shadow-primary-500/20">
                        <span className="text-white text-3xl font-black">ن</span>
                    </div>
                    <div className="absolute -inset-2 rounded-3xl bg-primary-500/20 animate-ping" />
                </div>

                {/* Skeleton Cards */}
                <div className="w-full max-w-md space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mx-auto animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mx-auto animate-pulse" />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}
