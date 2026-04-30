import Sidebar from "@/app/components/SideBar";

export const metadata = {
    title: "Dashboard - Meeting Management",
    description: "Meeting Management App",
};

export default function Dashboard() {

    return(
        <div className="flex flex-col md:flex-row h-screen w-full">
            <Sidebar />
            <main>
                <h1>Dashboard</h1>
            </main>
        </div>
    )
}