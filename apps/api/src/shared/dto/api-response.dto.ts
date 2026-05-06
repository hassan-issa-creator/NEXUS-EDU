export class ApiResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;

    constructor(partial: Partial<ApiResponseDto<T>>) {
        Object.assign(this, partial);
        this.timestamp = new Date().toISOString();
    }

    static success<T>(data: T, message?: string): ApiResponseDto<T> {
        return new ApiResponseDto({ success: true, data, message });
    }

    static error<T>(error: string): ApiResponseDto<T> {
        return new ApiResponseDto({ success: false, error });
    }
}
