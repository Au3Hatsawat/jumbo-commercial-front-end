import { PAGE_TRANSLATION_KEYS } from "@/libs/const/page-names";

export const getPageTranslationKey = (pathname: string): string => {
    for (const [key, value] of Object.entries(PAGE_TRANSLATION_KEYS)) {
        if (pathname.startsWith(key)) {
            return value;
        }
    }
    return 'default';
}
