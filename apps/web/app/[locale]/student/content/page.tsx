'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Play, FileText, Link as LinkIcon, Video, Music, BookOpen, Heart, Bookmark, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ContentPage() {
    const t = useTranslations();
    const [filter, setFilter] = useState('all');

    const contentItems = [
        {
            id: '1',
            title: 'مقدمة في الرياضيات',
            type: 'video',
            icon: Video,
            duration: '15:30',
            progress: 75,
            thumbnail: '🎥',
            views: 1234,
            likes: 89,
        },
        {
            id: '2',
            title: 'ملخص الفيزياء - الفصل الأول',
            type: 'document',
            icon: FileText,
            size: '2.5 MB',
            progress: 100,
            thumbnail: '📄',
            views: 567,
            likes: 45,
        },
        {
            id: '3',
            title: 'شرح الكيمياء العضوية',
            type: 'video',
            icon: Video,
            duration: '22:15',
            progress: 30,
            thumbnail: '🎬',
            views: 890,
            likes: 67,
        },
        {
            id: '4',
            title: 'موارد إضافية - Khan Academy',
            type: 'link',
            icon: LinkIcon,
            url: 'khanacademy.org',
            progress: 0,
            thumbnail: '🔗',
            views: 234,
            likes: 12,
        },
        {
            id: '5',
            title: 'الأحياء - الخلية الحية',
            type: 'video',
            icon: Video,
            duration: '18:45',
            progress: 50,
            thumbnail: '🎞️',
            views: 445,
            likes: 34,
        },
        {
            id: '6',
            title: 'مراجعة التاريخ',
            type: 'audio',
            icon: Music,
            duration: '12:00',
            progress: 0,
            thumbnail: '🎧',
            views: 123,
            likes: 8,
        },
    ];

    const filteredContent = filter === 'all'
        ? contentItems
        : contentItems.filter(item => item.type === filter);

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">📚 المكتبة التعليمية</h1>
                <p className="text-muted-foreground mt-2">
                    فيديوهات، ملفات، روابط مفيدة وكل المحتوى التعليمي
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Video className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">الفيديوهات</p>
                            <p className="text-3xl font-bold">48</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">الملفات</p>
                            <p className="text-3xl font-bold">32</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <LinkIcon className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">الروابط</p>
                            <p className="text-3xl font-bold">15</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">ساعات المشاهدة</p>
                            <p className="text-3xl font-bold">12.5</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg ${filter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    الكل
                </button>
                <button
                    onClick={() => setFilter('video')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'video'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <Video className="w-4 h-4" />
                    فيديوهات
                </button>
                <button
                    onClick={() => setFilter('document')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'document'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    ملفات PDF
                </button>
                <button
                    onClick={() => setFilter('link')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'link'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    روابط
                </button>
                <button
                    onClick={() => setFilter('audio')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'audio'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <Music className="w-4 h-4" />
                    صوتيات
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={`/student/content/${item.id}`}
                            className="group"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all hover:shadow-lg">
                                {/* Thumbnail */}
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center text-6xl">
                                    {item.thumbnail}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Icon className="w-5 h-5 text-primary mt-0.5" />
                                        <h3 className="font-bold flex-1 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                        {item.duration && <span>⏱️ {item.duration}</span>}
                                        {item.size && <span>📦 {item.size}</span>}
                                        {item.url && <span className="truncate">🔗 {item.url}</span>}
                                    </div>

                                    {/* Progress Bar */}
                                    {item.progress > 0 && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span>التقدم</span>
                                                <span>{item.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Play className="w-4 h-4" />
                                                {item.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                {item.likes}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Bookmark className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
