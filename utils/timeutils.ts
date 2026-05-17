import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime'; 
import buddhistEra from 'dayjs/plugin/buddhistEra'; 
import 'dayjs/locale/th'; 

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(buddhistEra);

dayjs.locale('th');

const DEFAULT_TZ = 'Asia/Bangkok';

export const formatDate = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return '-';
    return dayjs(dateStr).tz(DEFAULT_TZ).format('D MMM BBBB');
};

export const formatDateTime = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return '-';
    return dayjs(dateStr).tz(DEFAULT_TZ).format('D MMM BBBB, HH:mm น.');
};

export const timeAgo = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return '-';
    return dayjs(dateStr).fromNow();
};

export default dayjs;