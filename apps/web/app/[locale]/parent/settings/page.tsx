'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function ParentSettingsPage() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        toast({
            title: 'تم حفظ الإعدادات',
            description: 'تم تحديث بياناتك بنجاح',
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">إعدادات ولي الأمر</h2>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>الملف الشخصي</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>الاسم الكامل</Label>
                                <Input defaultValue={profile?.full_name} />
                            </div>
                            <div className="space-y-2">
                                <Label>البريد الإلكتروني</Label>
                                <Input defaultValue={user?.email} disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>متابعة الطلاب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>إشعارات الدرجات</Label>
                                <p className="text-sm text-gray-500">تنبيه فوري عند حصول الابن على درجة مسجلة</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>إشعارات الغياب</Label>
                                <p className="text-sm text-gray-500">تنبيه في حال غياب أو تأخر الابن</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
