export default function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 text-center text-sm text-gray-600 italic dark:text-gray-400">
      {children}
    </div>
  )
}
