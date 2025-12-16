
export default function Caption({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-2 text-center text-sm italic text-gray-600 dark:text-gray-400">
            {children}
        </div>
    )
}
