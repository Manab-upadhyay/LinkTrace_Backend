export default function normalizeHourlyData(rawData: any[]) {
  // Use IST timezone since MongoDB queries group by Asia/Kolkata timezone
  const now = new Date();
  const currentHourISTStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  }).format(now);
  let currentHour = parseInt(currentHourISTStr, 10);
  if (currentHour === 24) currentHour = 0; // Handles format oddities returning 24

  const hoursMap = new Map<number, number>();

  rawData.forEach((item) => {
    const hour = item.hour ?? item._id?.hour ?? item._id; // supports both structures
    const total = item.total ?? item.totalClicks ?? item.totalRequests ?? 0;

    if (hour !== undefined) {
      hoursMap.set(hour, (hoursMap.get(hour) || 0) + total); // Sums up in case of duplicates
    }
  });

  const result = [];

  // Generate the rolling 24 hours chronologically (e.g., 16:00 to 15:00 if it's 3 PM right now)
  for (let i = 23; i >= 0; i--) {
    let h = currentHour - i;
    if (h < 0) {
      h += 24;
    }
    result.push({
      hour: `${h}:00`,
      total: hoursMap.get(h) ?? 0,
    });
  }

  return result;
}