'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Globe, Save } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';

export default function NotificationSettingsPage() {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        webPushNotifications: true,
        inAppNotifications: true,
        whatsappNotifications: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulated API call - In a real app, this would update the User model
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('تم حفظ الإعدادات بنجاح!');
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold mb-2">🔔 إعدادات التنبيهات</h1>
                <p className="text-gray-500">تحكم في كيفية وصول التنبيهات إليك</p>
            </motion.div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-500" />
                            تنبيهات البريد الإلكتروني
                        </CardTitle>
                        <CardDescription>
                            استلام ملخص الأداء والتقارير الأسبوعية عبر الإيميل
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">تفعيل تنبيهات البريد</Label>
                        <Switch 
                            id="email-notifications" 
                            checked={settings.emailNotifications}
                            onCheckedChange={() => handleToggle('emailNotifications')}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-purple-500" />
                            تنبيهات المتصفح (Web Push)
                        </CardTitle>
                        <CardDescription>
                            وصول إشعارات فورية على المتصفح عند وجود واجب جديد أو رسالة
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <Label htmlFor="web-push">تفعيل تنبيهات المتصفح</Label>
                        <Switch 
                            id="web-push" 
                            checked={settings.webPushNotifications}
                            onCheckedChange={() => handleToggle('webPushNotifications')}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            التنبيهات داخل التطبيق
                        </CardTitle>
                        <CardDescription>
                            عرض الإشعارات داخل المنصة عند تسجيل الدخول
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <Label htmlFor="in-app">تفعيل الإشعارات الداخلية</Label>
                        <Switch 
                            id="in-app" 
                            checked={settings.inAppNotifications}
                            onCheckedChange={() => handleToggle('inAppNotifications')}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-green-500" />
                            تنبيهات WhatsApp
                        </CardTitle>
                        <CardDescription>
                            (قريباً) استلام تنبيهات غياب الطالب والتقارير الهامة عبر واتساب
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between opacity-50">
                        <Label htmlFor="whatsapp">تفعيل WhatsApp</Label>
                        <Switch id="whatsapp" disabled checked={settings.whatsappNotifications} />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="gap-2"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </Button>
            </div>
        </div>
    );
}
