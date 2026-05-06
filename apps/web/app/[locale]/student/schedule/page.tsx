'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function SchedulePage() {
    const schedule = {
        Monday: [
            { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Prof. Ahmed', room: 'Room 101' },
            { time: '09:15 - 10:15', subject: 'Physics', teacher: 'Dr. Sarah', room: 'Lab 2' },
            { time: '10:30 - 11:30', subject: 'Chemistry', teacher: 'Prof. Hassan', room: 'Lab 1' },
            { time: '12:00 - 13:00', subject: 'English', teacher: 'Ms. Fatima', room: 'Room 203' },
        ],
        Tuesday: [
            { time: '08:00 - 09:00', subject: 'History', teacher: 'Dr. Omar', room: 'Room 105' },
            { time: '09:15 - 10:15', subject: 'Computer Science', teacher: 'Eng. Nour', room: 'Lab 3' },
            { time: '10:30 - 11:30', subject: 'Mathematics', teacher: 'Prof. Ahmed', room: 'Room 101' },
        ],
        Wednesday: [
            { time: '08:00 - 09:00', subject: 'Physics', teacher: 'Dr. Sarah', room: 'Lab 2' },
            { time: '09:15 - 10:15', subject: 'English', teacher: 'Ms. Fatima', room: 'Room 203' },
            { time: '10:30 - 11:30', subject: 'Chemistry', teacher: 'Prof. Hassan', room: 'Lab 1' },
        ],
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Class Schedule</h1>
                <p className="text-muted-foreground mt-2">Your weekly class timetable</p>
            </div>

            <div className="space-y-6">
                {Object.entries(schedule).map(([day, classes]) => (
                    <Card key={day}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {day}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {classes.map((classItem, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[130px]">
                                                <Clock className="w-4 h-4" />
                                                {classItem.time}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{classItem.subject}</h3>
                                                <p className="text-sm text-muted-foreground">{classItem.teacher}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            {classItem.room}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
