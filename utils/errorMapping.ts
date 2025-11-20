import axios, { AxiosError } from 'axios';
interface ApiErrorResponse {
    status?: string;
    code?: string;
    message?: string;
}

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {

        const axiosError = error as AxiosError<ApiErrorResponse>;

        const serverError = axiosError.response?.data;
        const code = serverError?.code;
        const fallbackMessage = serverError?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';

        switch (code) {
            case 'PRODUCT_NOT_FOUND':
                return 'ไม่พบสินค้านี้ในระบบ กรุณาตรวจสอบใหม่อีกครั้ง';

            case 'STOCK_INSUFFICIENT':
                return 'สินค้าในสต็อกไม่เพียงพอสำหรับการทำรายการ';

            case 'CUSTOMER_NOT_FOUND':
                return 'ไม่พบข้อมูลลูกค้า กรุณาสมัครสมาชิกใหม่';

            case 'DB_ERROR':
                return 'ระบบฐานข้อมูลขัดข้อง กรุณาลองใหม่ภายหลัง';

            case 'INVALID_PHONE_FORMAT':
                return 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0)';

            default:
                return fallbackMessage;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};