// moment.defineLocale("nm-base", {
//     parentLocale: "en",
//     relativeTime: {
//         future: "just now",
//         past: "%s",
//         s: "just now",
//         m: "just now",
//         mm: "%d minutes ago",
//         h: "1 hour ago",
//         hh: "%d hours ago",
//         d: "1 day ago",
//         dd: "%d days ago",
//         M: "1 month ago",
//         MM: "%d months ago",
//         y: "1 year ago",
//         yy: "%d years ago",
//     },
// });

// moment.defineLocale("nm-medium", {
//     parentLocale: "en",
//     relativeTime: {
//         future: "just now",
//         past: "%s",
//         s: "just now",
//         m: "just now",
//         mm: "%d min ago",
//         h: "1 hour ago",
//         hh: "%d hours ago",
//         d: "1 day ago",
//         dd: "%d days ago",
//         M: "1 month ago",
//         MM: "%d months ago",
//         y: "1 year ago",
//         yy: "%d years ago",
//     },
// });

// moment.defineLocale("nm-condense", {
//     parentLocale: "en",
//     relativeTime: {
//         future: "now",
//         past: "%s",
//         s: "now",
//         m: "now",
//         mm: "%d mins",
//         h: "1 hr",
//         hh: "%d hrs",
//         d: "1 day",
//         dd: "%d days",
//         M: "1 mon",
//         MM: "%d mos",
//         y: "1 yr",
//         yy: "%d yrs",
//     },
// });

// moment.defineLocale("nm-til", {
//     parentLocale: "en",
//     relativeTime: {
//         future: "%s",
//         past: "0 minutes left",
//         s: "less than 1 minute left",
//         m: "less than 1 minute left",
//         mm: "%d minutes left",
//         h: "1 hour left",
//         hh: "%d hours left",
//         d: "1 day left",
//         dd: "%d days left",
//         M: "1 month left",
//         MM: "%d months left",
//         y: "1 year left",
//         yy: "%d years left",
//     },
// });

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime, {
    thresholds: [
        { l: "m", r: 1 },
        { l: "mm", r: 59, d: "minute" },
        { l: "h", r: 1 },
        { l: "hh", r: 71, d: "hour" },
        { l: "d", r: 1 },
        { l: "dd", r: 29, d: "day" },
        { l: "M", r: 1 },
        { l: "MM", r: 11, d: "month" },
        { l: "y" },
        { l: "yy", d: "year" },
    ],
});
// load and set locale for NM
const locale = {
    name: "nm-relative",
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
    formats: {},
    relativeTime: {
        future: "%s left",
        past (out: string) {
            if (!out || out.includes("now")) return out;
            return `${out} ago`;
        },
        m (n:number, _withoutSuffix:boolean, _key:string, isFuture:boolean) {
            return isFuture
                ? (n ? "less than 1 minute" : "0 minutes")
                : "just now";
        },
        mm: "%d minutes",
        h: "1 hour",
        hh: "%d hours",
        d: "1 day",
        dd: "%d days",
        M: "1 month",
        MM: "%d months",
        y: "1 year",
        yy: "%d years",
    },
};
// @ts-ignore - ILocale doesn't supports functions in relativeTime
dayjs.locale(locale);

// function toPluralize (val: number, str: string) {
//     return (val<=1 ? str : str+'s')
// }

// function formDiscontStr (inDays: number, inHours: number, inMins: number, inMonths: number) {
//     if(inMins >= 1  && inMins < 60) {
//         return inMins + ' ' + toPluralize(inMins, 'minute');
//     }
//     else if(inHours >= 1 && inHours < 24) {
//         return inHours + ' ' + toPluralize(inHours, 'hour');
//     }
//     else if(inDays >= 1 && inDays < 11) {
//         return inDays + ' ' + toPluralize(inDays, 'day');
//     }
//     return false;
// }

// function findDiff (startDate: moment.Moment, endDate: moment.Moment) {
//     const inDays = Math.round(endDate.diff(startDate, 'days', true));
//     const inHours = Math.round(endDate.diff(startDate, 'hours', true));
//     const inMins = Math.round(endDate.diff(startDate, 'minutes', true));
//     const inMonths = Math.round(endDate.diff(startDate, 'months', true));
//     return formDiscontStr(inDays, inHours, inMins, inMonths);
// }

/**
 * Text representation of time passed since the given time
 * @param time - the target time
 * @param baseTime - the current time, default - now
 * @param isCondensed - use condensed format, no by default
 */
export function timeAgo (time: string, baseTime?: string, isCondensed = false) {
    const locale = isCondensed ? "nm-condense" : "nm-base";
    return baseTime
        ? dayjs(time, { locale }).from(baseTime)
        : dayjs(time, {}, true).fromNow();
}

// /**
//  * Text representation of time til the given time
//  * @param time - the target time
//  * @param isCondensed - use condensed format, no by default
//  * @param hourToDate - amount of hours before switching to days, default - 72
//  */
// export function timeTil (time: string, isCondensed = false, hourToDate = 72) {
//     moment.locale(isCondensed ? "nm-condense" : "nm-til");
//     moment.relativeTimeThreshold('h', hourToDate);
//     return moment().to(time);
// }

/**
 * Text representation of time til the given time in HH:mm:ss or mm:ss format
 * @param time - the target time
 * @returns the text or empty text if the target time has passed
 */
export function timeTil (time: number) {
    const left = Math.round((time - Date.now()) / 1000);
    if (left <= 0) return "";
    const numbers = [
        Math.floor((left / 60) % 60),
        Math.floor(left % 60),
    ];
    if (left >= 3600) numbers.unshift(Math.floor(left / 3600));
    return numbers.map((n) => n.toString().padStart(2, "0")).join(":");
}

/**
 * Text ISO8601 timestamp of now
 */
export function timestampNow () {
    return dayjs().format();
}

// eslint-disable-next-line unicorn/prefer-export-from
export default dayjs;

export const TIMEZONES = [
    { offset: -840, name: "(GMT+14:00) Pacific/Kiritimati" },
    { offset: -780, name: "(GMT+13:00) Pacific/Apia" },
    { offset: -765, name: "(GMT+12:45) Pacific/Chatham" },
    { offset: -720, name: "(GMT+12:00) Pacific/Auckland" },
    { offset: -690, name: "(GMT+11:30) Pacific/Norfolk" },
    { offset: -660, name: "(GMT+11:00) Asia/Kamchatka" },
    { offset: -630, name: "(GMT+10:30) Australia/Lord Howe" },
    { offset: -600, name: "(GMT+10:00) Australia/Sydney" },
    { offset: -570, name: "(GMT+09:30) Australia/Adelaide" },
    { offset: -540, name: "(GMT+09:00) Asia/Tokyo" },
    { offset: -525, name: "(GMT+08:45) Australia/Eucla" },
    { offset: -480, name: "(GMT+08:00) Asia/Shanghai" },
    { offset: -420, name: "(GMT+07:00) Asia/Jakarta" },
    { offset: -390, name: "(GMT+06:30) Asia/Rangoon" },
    { offset: -360, name: "(GMT+06:00) Asia/Omsk" },
    { offset: -345, name: "(GMT+05:45) Asia/Kathmandu" },
    { offset: -330, name: "(GMT+05:30) Asia/Kolkata" },
    { offset: -300, name: "(GMT+05:00) Asia/Karachi" },
    { offset: -270, name: "(GMT+04:30) Asia/Kabul" },
    { offset: -240, name: "(GMT+04:00) Asia/Dubai" },
    { offset: -210, name: "(GMT+03:30) Asia/Tehran" },
    { offset: -180, name: "(GMT+03:00) Europe/Moscow" },
    { offset: -120, name: "(GMT+02:00) Africa/Johannesburg" },
    { offset: -60, name: "(GMT+01:00) Europe/Berlin" },
    { offset: 0, name: "(GMT+00:00) Europe/London" },
    { offset: 60, name: "(GMT-01:00) Atlantic/Cape Verde" },
    { offset: 120, name: "(GMT-02:00) Etc/GMT+2" },
    { offset: 180, name: "(GMT-03:00) America/Argentina/Buenos Aires" },
    { offset: 210, name: "(GMT-03:30) America/St Johns" },
    { offset: 240, name: "(GMT-04:00) America/Halifax" },
    { offset: 270, name: "(GMT-04:30) America/Caracas" },
    { offset: 300, name: "(GMT-05:00) America/New York" },
    { offset: 360, name: "(GMT-06:00) America/Chicago" },
    { offset: 420, name: "(GMT-07:00) America/Denver" },
    { offset: 480, name: "(GMT-08:00) America/Los Angeles" },
    { offset: 540, name: "(GMT-09:00) America/Anchorage" },
    { offset: 570, name: "(GMT-09:30) Pacific/Marquesas" },
    { offset: 600, name: "(GMT-10:00) Pacific/Honolulu" },
    { offset: 660, name: "(GMT-11:00) Pacific/Pago Pago" },
    { offset: 720, name: "(GMT-12:00) Etc/GMT+12" },
];
