/*
 * Nhãn tuyến hiển thị được SUY RA từ điểm đi – điểm đến, không dùng `route.name`
 * của DB (trường này có thể lệch với 2 khu vực). Mọi màn hiển thị tuyến đều đi qua
 * đây để nhãn luôn khớp với `originAreaName`/`destinationAreaName`.
 */
export function routeLabel(
  originAreaName: string,
  destinationAreaName: string
): string {
  return [originAreaName, destinationAreaName].filter(Boolean).join(" → ");
}

/* Nhãn tuyến ở mức bến xe: "BX <điểm đi> → BX <điểm đến>". */
export function routeLabelWithStation(
  originAreaName: string,
  destinationAreaName: string
): string {
  return [originAreaName, destinationAreaName]
    .filter(Boolean)
    .map((name) => `BX ${name}`)
    .join(" → ");
}
