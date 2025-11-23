'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ElementsPage() {
    const router = useRouter();
    const [elements, setElements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // TODO: Fetch elements from API
        setLoading(false);
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                        ← Back to Dashboard
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">Elements</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Building Elements</CardTitle>
                        <CardDescription>Manage elements synced from BIM</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {elements.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    No elements yet
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    Use the pyRevit extension to sync elements from Revit
                                </p>
                                <Button>Learn How to Sync</Button>
                            </div>
                        ) : (
                            <div>Elements table will go here</div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
