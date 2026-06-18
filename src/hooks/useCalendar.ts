// @/hooks/useCalendar.ts

"use client";

export const useCalendar = () => {
  const toEthiopian = (
    gregorianDate: Date,
    options?: { includeTime?: boolean }
  ): string => {
    const etTime = new Date(gregorianDate.getTime() - 6 * 60 * 60 * 1000);

    const timeString = options?.includeTime
      ? etTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    const ethiopianWeekdays = [
      "እሁድ",
      "ሰኞ",
      "ማክሰኞ",
      "ረቡዕ",
      "ሐሙስ",
      "ዓርብ",
      "ቅዳሜ",
    ];

    const ethiopianMonths = [
      "መስከረም",
      "ጥቅምት",
      "ህዳር",
      "ታህሳስ",
      "ጥር",
      "የካቲት",
      "መጋቢት",
      "ሚያዚያ",
      "ግንቦት",
      "ሰኔ",
      "ሐምሌ",
      "ነሐሴ",
      "ጷግሜ",
    ];

    const isLeapYear = (year: number) =>
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    const gregorianToJDN = (year: number, month: number, day: number) => {
      const a = Math.floor((14 - month) / 12);
      year = year + 4800 - a;
      month = month + 12 * a - 3;
      return (
        day +
        Math.floor((153 * month + 2) / 5) +
        365 * year +
        Math.floor(year / 4) -
        Math.floor(year / 100) +
        Math.floor(year / 400) -
        32045
      );
    };

    const JDNToEthiopian = (jdn: number) => {
      const r = (jdn - 1723856) % 1461;
      const n = (r % 365) + 365 * Math.floor(r / 1460);

      const year =
        4 * Math.floor((jdn - 1723856) / 1461) +
        Math.floor(r / 365) -
        Math.floor(r / 1460);
      const month = Math.floor(n / 30) + 1;
      const day = (n % 30) + 1;

      return { year, month, day };
    };

    const gregorianYear = gregorianDate.getFullYear();
    const gregorianMonth = gregorianDate.getMonth() + 1;
    const gregorianDay = gregorianDate.getDate();
    const weekday = ethiopianWeekdays[gregorianDate.getDay()];

    const jdn = gregorianToJDN(gregorianYear, gregorianMonth, gregorianDay);
    const ethiopianDate = JDNToEthiopian(jdn);

    if (ethiopianDate.month === 13) {
      const maxPagumeDays = isLeapYear(ethiopianDate.year + 1) ? 6 : 5;
      if (ethiopianDate.day > maxPagumeDays) {
        ethiopianDate.month = 1;
        ethiopianDate.day -= maxPagumeDays;
        ethiopianDate.year++;
      }
    }

    const dateStr = `${weekday}፣ ${ethiopianMonths[ethiopianDate.month - 1]} ${ethiopianDate.day} ${ethiopianDate.year}`;
    return options?.includeTime ? `${timeString}፣ ${dateStr}` : dateStr;
  };

  return { toEthiopian };
};