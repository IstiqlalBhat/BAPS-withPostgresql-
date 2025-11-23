'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


interface UploadAvailabilityProps {
    userId: string;
    subcontractorId?: string; // Optional, might need to fetch if not available
    onSuccess?: () => void;
}

export function UploadAvailability({ userId, subcontractorId, onSuccess }: UploadAvailabilityProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        availabilityFrom: '',
        availabilityTo: '',
        location: '',
        workType: '',
        materialCostPerSqm: '',
        laborCostPerSqm: '',
        maximumCapacity: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // If we don't have subcontractorId, we might need to fetch it or use a different endpoint
            // For now assuming we have it or the user is the subcontractor
            // But wait, the route is /api/sc/:id/availability
            // We need the Subcontractor ID, not the User ID.
            // Let's assume for now we can get it from local storage or context, or we fetch it first.

            let targetScId = subcontractorId;

            if (!targetScId) {
                // Fetch SC ID using User ID
                // This is a placeholder. In a real app, we'd probably have this in the user context
                // or fetch it on mount.
                // For this implementation, let's assume the parent passes it or we fail.
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/users/${userId}/subcontractor`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    targetScId = data.id;
                } else {
                    throw new Error('Could not find Subcontractor profile');
                }
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/sc/${targetScId}/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    materialCostPerSqm: parseFloat(formData.materialCostPerSqm),
                    laborCostPerSqm: parseFloat(formData.laborCostPerSqm),
                    maximumCapacity: parseFloat(formData.maximumCapacity)
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message || 'Failed to upload availability');
            }

            setSuccess(true);
            setFormData({
                availabilityFrom: '',
                availabilityTo: '',
                location: '',
                workType: '',
                materialCostPerSqm: '',
                laborCostPerSqm: '',
                maximumCapacity: ''
            });
            if (onSuccess) onSuccess();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Availability & Pricing</CardTitle>
                <CardDescription>Update your availability and unit costs for upcoming projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="availabilityFrom">Available From</Label>
                            <Input
                                id="availabilityFrom"
                                name="availabilityFrom"
                                type="date"
                                required
                                value={formData.availabilityFrom}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="availabilityTo">Available To</Label>
                            <Input
                                id="availabilityTo"
                                name="availabilityTo"
                                type="date"
                                required
                                value={formData.availabilityTo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="e.g. New York, NY"
                                required
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workType">Work Type</Label>
                            <select
                                name="workType"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => handleSelectChange('workType', e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Select work type</option>
                                <option value="Framing">Framing</option>
                                <option value="Drywall">Drywall</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="HVAC">HVAC</option>
                                <option value="Painting">Painting</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="materialCostPerSqm">Material Cost ($/sqm)</Label>
                            <Input
                                id="materialCostPerSqm"
                                name="materialCostPerSqm"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={formData.materialCostPerSqm}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="laborCostPerSqm">Labor Cost ($/sqm)</Label>
                            <Input
                                id="laborCostPerSqm"
                                name="laborCostPerSqm"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={formData.laborCostPerSqm}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maximumCapacity">Max Capacity (sqm)</Label>
                            <Input
                                id="maximumCapacity"
                                name="maximumCapacity"
                                type="number"
                                min="0"
                                required
                                value={formData.maximumCapacity}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-500">Availability uploaded successfully!</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Uploading...' : 'Submit Availability'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
