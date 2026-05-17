import axios, { AxiosError } from 'axios';
export interface ErrorResponse {
    code?: string;
    status?: string;
    title?: string;
    message?: string;
}

export const getErrorResponse = (error: AxiosError<ErrorResponse> | Error): ErrorResponse | undefined => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return axiosError.response?.data;
    }
};