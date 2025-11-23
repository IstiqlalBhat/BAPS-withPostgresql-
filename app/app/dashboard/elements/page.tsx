'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ElementsPage() {
    const router = useRouter();
    const [elements, setElements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch elements from API
        const fetchElements = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3001/api/elements', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch elements');
                }

                const data = await response.json();
                // Handle both array and object with 'elements' property
                const elementsList = Array.isArray(data) ? data : data.elements || [];
                setElements(elementsList);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch elements');
                console.error('Error fetching elements:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchElements();
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
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">⏳</div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Loading elements...
                                </h3>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Error loading elements
                                </h3>
                                <p className="text-slate-600">{error}</p>
                            </div>
                        ) : elements.length === 0 ? (
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
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-100 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Quantity</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Unit</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Revit ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {elements.map((element, idx) => (
                                            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="px-4 py-3 text-sm text-slate-900">{element.name || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{element.category || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{element.quantity || 0}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{element.unit || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-slate-500 font-mono">{element.revitId || element.id || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 text-sm text-slate-600">
                                    Total: <span className="font-semibold">{elements.length}</span> elements
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
