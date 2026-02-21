import LoadingSpinner from '@/components/LoadingSpinner'

export default function AdminLoading() {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-gray-400 animate-pulse tracking-widest uppercase">Loading Panel...</p>
        </div>
    )
}
