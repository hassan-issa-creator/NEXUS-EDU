'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, FileText, Award, Calendar, Users, CheckCircle2, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    type: 'assignment' | 'grade' | 'announcement' | 'reminder';
    title: string;
    description: string;
    timestamp: Date;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'assignment',
        title: 'واجب جديد: الرياضيات',
        description: 'تم إضافة واجب جديد في مادة الرياضيات (القسمة)، الموعد النهائي بعد يومين.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'high',
        actionUrl: '/student/assignments/1'
    },
    {
        id: '2',
        type: 'grade',
        title: 'تحديث درجة الاختبار',
        description: 'تم رصد درجة اختبار الفيزياء الأخير: 95/100. أحسنت!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        priority: 'medium',
        actionUrl: '/student/grades'
    },
    {
        id: '3',
        type: 'announcement',
        title: 'إعلان: تعديل جدول الشتاء',
        description: 'يرجى العلم بأنه تم تحديث جدول الإجازة الشتوية، تفضل بزيارة صفحة الإعلانات.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        priority: 'low'
    },
    {
        id: '4',
        type: 'reminder',
        title: 'تذكير: معمل الكيمياء',
        description: 'تبدأ حصة معمل الكيمياء العملي بعد ساعة من الآن في المختبر رقم 3.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        read: false,
        priority: 'high',
        actionUrl: '/student/schedule'
    },
];

export function EnhancedNotifications() {
    const t = useTranslations('notifications');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'assignment' | 'grade' | 'announcement' | 'reminder'>('all');

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.type === filter);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'assignment': return <FileText className="w-5 h-5" />;
            case 'grade': return <Award className="w-5 h-5" />;
            case 'announcement': return <Users className="w-5 h-5" />;
            case 'reminder': return <Calendar className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'assignment': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            case 'grade': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'announcement': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
            case 'reminder': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return <Badge variant="destructive" className="text-[10px] px-2 py-0 h-5 font-bold">{t('priority.high')}</Badge>;
            case 'medium': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-2 py-0 h-5 font-bold border-none">{t('priority.medium')}</Badge>;
            case 'low': return <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-bold">{t('priority.low')}</Badge>;
            default: return null;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors w-10 h-10">
                    <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-black border-2 border-white dark:border-gray-950"
                        >
                            {unreadCount}
                        </motion.span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[420px] p-0 bg-white dark:bg-gray-950 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden z-[100]"
                align={isRtl ? "start" : "end"}
                sideOffset={10}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-50 dark:bg-primary-950/30 rounded-xl">
                            <Bell className="w-5 h-5 text-primary-600" />
                        </div>
                        <h3 className="font-black text-lg text-gray-900 dark:text-white">{t('title')}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg h-8"
                            >
                                <Settings className="w-3 h-3 mr-1" />
                                {t('markAllAsRead')}
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
                    <TabsList className="w-full flex h-12 p-0 rounded-none bg-white dark:bg-gray-950 border-b border-gray-50 dark:border-gray-800 overflow-x-auto no-scrollbar justify-start px-2">
                        <TabsTrigger value="all" className="flex-shrink-0 text-xs font-bold px-4 h-10 data-[state=active]:bg-transparent data-[state=active]:text-primary-600 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600 after:scale-x-0 data-[state=active]:after:scale-x-100 transition-all">{t('all')}</TabsTrigger>
                        <TabsTrigger value="assignment" className="flex-shrink-0 text-xs font-bold px-4 h-10 data-[state=active]:bg-transparent data-[state=active]:text-primary-600 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600 after:scale-x-0 data-[state=active]:after:scale-x-100 transition-all">{t('tasks')}</TabsTrigger>
                        <TabsTrigger value="grade" className="flex-shrink-0 text-xs font-bold px-4 h-10 data-[state=active]:bg-transparent data-[state=active]:text-primary-600 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600 after:scale-x-0 data-[state=active]:after:scale-x-100 transition-all">{t('grades')}</TabsTrigger>
                        <TabsTrigger value="announcement" className="flex-shrink-0 text-xs font-bold px-4 h-10 data-[state=active]:bg-transparent data-[state=active]:text-primary-600 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600 after:scale-x-0 data-[state=active]:after:scale-x-100 transition-all">{t('news')}</TabsTrigger>
                        <TabsTrigger value="reminder" className="flex-shrink-0 text-xs font-bold px-4 h-10 data-[state=active]:bg-transparent data-[state=active]:text-primary-600 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600 after:scale-x-0 data-[state=active]:after:scale-x-100 transition-all">{t('reminders')}</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[420px]">
                        <div className="p-3 bg-white dark:bg-gray-950">
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-950"
                                    >
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-full mb-4">
                                            <Bell className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">{t('noNotifications')}</p>
                                    </motion.div>
                                ) : (
                                    filteredNotifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "p-4 rounded-2xl mb-3 cursor-pointer transition-all border border-transparent shadow-sm",
                                                notification.read
                                                    ? 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-50 dark:border-gray-800'
                                                    : 'bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30'
                                            )}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn("p-3 rounded-xl shadow-sm", getIconColor(notification.type))}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1 gap-2">
                                                        <p className={cn(
                                                            "font-bold text-sm truncate",
                                                            notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                                                        )}>
                                                            {notification.title}
                                                        </p>
                                                        {getPriorityBadge(notification.priority)}
                                                    </div>
                                                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                                                        {notification.description}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDistanceToNow(notification.timestamp, {
                                                                addSuffix: true,
                                                                locale: locale === 'ar' ? arSA : undefined
                                                            })}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notification.id);
                                                                    }}
                                                                    className="h-7 px-2 text-[10px] font-black text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg"
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    {t('markAsRead')}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification.id);
                                                                }}
                                                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </Tabs>

                <div className="p-4 border-t border-gray-50 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-900/10">
                    <Button variant="ghost" className="w-full text-xs font-black text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 rounded-xl">
                        {t('viewAll')}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
