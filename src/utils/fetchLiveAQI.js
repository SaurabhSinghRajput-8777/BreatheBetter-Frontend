export async function fetchLiveAQI(city) {
  const res = await fetch(`/current_aqi?city=${city}`);
  return res.json();
}
