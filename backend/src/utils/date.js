export const startOfUtcDay = (value) => {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const endOfUtcDay = (value) => {
  const date = new Date(value);
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

export const isWithinRange = (value, start, end) => {
  const timestamp = new Date(value).getTime();
  return (!start || timestamp >= new Date(start).getTime())
    && (!end || timestamp <= new Date(end).getTime());
};
