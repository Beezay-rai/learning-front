import dayjs from "dayjs";

export const convertToISODate = (date: string, time: string) => {
  const newDate = dayjs(date).format("YYYY-MM-DD");
  return dayjs(`${newDate}T${time}`).format("YYYY-MM-DDTHH:mm:ss");
};
