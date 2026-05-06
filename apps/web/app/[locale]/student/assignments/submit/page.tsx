'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/FileUploader';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SubmitAssignmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const assignmentId = searchParams.get('id');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate submission
        setTimeout(() => {
            setSubmitting(false);
            alert('Assignment submitted successfully!');
            router.push('/student/assignments');
        }, 2000);
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Submit Assignment</h1>
                <p className="text-muted-foreground mt-2">Upload your completed work</p>
            </div>

            {/* Assignment Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Assignment: Mathematics Chapter 5 Exercises</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Due Date: December 10, 2024
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Time Remaining: 7 days
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Late submissions will be penalized. Please submit before the deadline.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Submission Form */}
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Submission</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Submission Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter a title for your submission"
                                required
                            />
                        </div>

                        {/* Comments */}
                        <div>
                            <Label htmlFor="comments">Comments (Optional)</Label>
                            <Textarea
                                id="comments"
                                placeholder="Add any comments or notes for your teacher"
                                rows={4}
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <Label className="mb-3 block">Upload Files</Label>
                            <FileUploader
                                acceptedTypes={['image/*', 'video/*', 'application/pdf']}
                                maxSizeMB={50}
                                onFilesChange={(files) => console.log('Files:', files)}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? 'Submitting...' : 'Submit Assignment'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
