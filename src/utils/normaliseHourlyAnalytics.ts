export default function normalizeHourlyData(rawData: any[]) {
  const currentHour = new Date().getHours();
  const hoursMap = new Map<number, number>();

  rawData.forEach((item) => {
    let utcHour = item.hour ?? item._id?.hour ?? item._id; // The hour from the DB (in UTC)
    const total = item.total ?? item.totalClicks ?? item.totalRequests ?? 0;

    if (utcHour !== undefined) {
      // Create a date object for today at the given UTC hour
      const date = new Date();
      date.setUTCHours(utcHour, 0, 0, 0);

      // Extract the local hour (IST) from that date
      const localHour = date.getHours(); 
      
      hoursMap.set(localHour, total);
    }
  });

  const result = [];

  for (let i = 0; i <= currentHour; i++) {
    result.push({
      hour: `${i}:00`,
      total: hoursMap.get(i) ?? 0,
    });
  }

  return result;
}
