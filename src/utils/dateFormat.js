const pad = (value) => String(value).padStart(2, "0");

// 2026.10.14 14:26
export const formatDateTime = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${formatTime(date)}`;
};

// 14:26
export const formatTime = (value) => {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
