export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-1 flex-col w-full">
            {children}
        </div>
    )
}
