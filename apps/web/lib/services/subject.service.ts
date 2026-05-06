import api from '../api';

export interface SubjectEntity {
    id: string;
    name: string;
    code?: string;
    description?: string;
    classId: string;
    class?: {
        name: string;
    };
    teacher?: {
        id: string;
        name: string;
        email: string;
    };
    _count?: {
        lessons: number;
        assignments: number;
    };
}

export interface CreateSubjectDto {
    name: string;
    code?: string;
    description?: string;
    classId: string;
    teacherId?: string;
}

export const subjectService = {
    getAll: async () => {
        const response = await api.get<SubjectEntity[]>('/subjects');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<SubjectEntity>(`/subjects/${id}`);
        return response.data;
    },

    create: async (data: CreateSubjectDto) => {
        const response = await api.post<SubjectEntity>('/subjects', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateSubjectDto>) => {
        const response = await api.patch<SubjectEntity>(`/subjects/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/subjects/${id}`);
        return response.data;
    },
};
