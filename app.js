function toMinutes(t){
  if (!t) return NaN;
  const match = String(t).match(/(\d{1,2}):(\d{2})/);
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}
