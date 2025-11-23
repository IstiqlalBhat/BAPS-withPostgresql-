'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadAvailability } from '@/components/UploadAvailability';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ elements: 0, projects: 0, pricing: 0 });

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">BAPS Dashboard</h1>
                        <p className="text-sm text-slate-600">BIM + AI Procurement System</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">{user.email}</span>
                        <Button variant="outline" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        Welcome back, {user.email.split('@')[0]}!
                    </h2>
                    <p className="text-slate-600">
                        Manage your building elements and procurement with AI-powered pricing.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total Elements</CardDescription>
                            <CardTitle className="text-4xl">{stats.elements}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">Synced from BIM</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Active Projects</CardDescription>
                            <CardTitle className="text-4xl">{stats.projects}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">In procurement</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>AI Pricing Suggestions</CardDescription>
                            <CardTitle className="text-4xl">{stats.pricing}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">Generated this month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Get started with your procurement workflow</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.role !== 'SUBCONTRACTOR' && (
                                <>
                                    <Button className="w-full" onClick={() => router.push('/dashboard/elements')}>
                                        📋 View Elements
                                    </Button>
                                    <Button className="w-full" variant="outline" disabled>
                                        🤖 Get AI Pricing
                                    </Button>
                                    <Button className="w-full" variant="outline" disabled>
                                        📊 View Reports
                                    </Button>
                                    <Button className="w-full" variant="outline" disabled>
                                        🔗 Connect pyRevit
                                    </Button>
                                </>
                            )}
                            {user.role === 'SUBCONTRACTOR' && (
                                <>
                                    <Button className="w-full" variant="outline" disabled>
                                        🔍 Find Opportunities
                                    </Button>
                                    <Button className="w-full" variant="outline" disabled>
                                        📈 Performance Stats
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Subcontractor Upload Section */}
                {user.role === 'SUBCONTRACTOR' && (
                    <div className="mt-8">
                        <UploadAvailability userId={user.id} />
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">🚀 Getting Started</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Install the pyRevit extension to sync elements from Revit</li>
                        <li>• View and manage your elements in the Elements section</li>
                        <li>• Use AI-powered pricing suggestions for cost estimation</li>
                        <li>• Export reports for procurement planning</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
