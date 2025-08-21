import AppLayout from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import NoteList from "@/components/notes/NoteList";
import CreateNoteButton from "@/components/notes/CreateNoteButton";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default async function NotesPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
                        <p className="text-gray-600">Capture your thoughts, ideas, and insights</p>
                    </div>
                    <CreateNoteButton />
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Bible Study</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Conference</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Song</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-pink-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Quote</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-indigo-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Reflection</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                </div>

                <NoteList />
            </div>
        </AppLayout>
    );
}
