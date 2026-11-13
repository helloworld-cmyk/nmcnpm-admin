"use client";

import { Icon } from "@/components/icons/icon";
import { DatePicker } from "@/components/ui/form";
import {
  type ChuyenLichPrefill,
  type ChuyenRecord,
  type TaiXeOption,
  type TrangThaiChuyen,
  type XeOption,
} from "../_data/chuyen";
import { useChuyenLich } from "../_hooks/use-chuyen-lich";

const BLOCK_CLASS: Record<TrangThaiChuyen, string> = {
  "sap-toi": "bg-[var(--orange-100)] text-[var(--orange-700)]",
  "dang-thuc-hien": "bg-[var(--sky-100)] text-[var(--sky-800)]",
  "hoan-thanh": "bg-[var(--green-100)] text-[var(--green-700)]",
  "da-huy": "bg-[var(--slate-200)] text-[var(--slate-600)]",
};

const LEGEND: { className: string; label: string }[] = [
  { className: "bg-[var(--orange-500)]", label: "Sắp tới / chưa phân công" },
  { className: "bg-[var(--sky-500)]", label: "Đang thực hiện" },
  { className: "bg-[var(--green-600)]", label: "Hoàn thành" },
  { className: "bg-[var(--slate-300)]", label: "Đã hủy" },
];

const LEGEND_ITEM_CLASS =
  "inline-flex items-center gap-1.5 text-[11.5px] text-[var(--slate-600)]";

const LEGEND_DOT_CLASS = "h-2.5 w-2.5 rounded-[3px]";

const LANE_NAME_CLASS = "text-[12.5px] font-bold text-[var(--ink)]";

const LANE_META_CLASS = "text-[11px] text-[var(--slate-500)]";

/* Bề rộng cột tài nguyên và bề rộng mỗi ô giờ trên trục thời gian (px). Cố định
   để mỗi ô giờ đủ rộng đọc được giờ/nhãn chuyến; trục dài thì cuộn ngang. */
const LANE_COL_WIDTH = 190;
const HOUR_CELL_WIDTH = 80;

const TRACK_CLASS = "relative h-[54px] cursor-pointer";

/* Lưới giờ: vạch đậm ở mốc giờ, vạch mờ ở mốc nửa giờ (khớp bước bấm 30'). */
const TRACK_STYLE = {
  backgroundImage:
    "linear-gradient(to right, var(--border-soft) 1px, transparent 1px), linear-gradient(to right, color-mix(in srgb, var(--border-soft) 55%, transparent) 1px, transparent 1px)",
} as const;

const BLOCK_BASE_CLASS =
  "absolute top-2 flex h-[38px] flex-col justify-center gap-px overflow-hidden rounded-[9px] px-2 text-left transition-transform duration-[var(--dur)] ease-[var(--ease)] hover:-translate-y-px";

const ADD_BTN_CLASS = "btn btn-sm btn-ghost row-icon-btn";

const ADD_BTN_NONE_CLASS = " !bg-[var(--sky-700)] !text-white";

type ChuyenLichProps = {
  trips: ChuyenRecord[];
  xeOptions: XeOption[];
  taixeOptions: TaiXeOption[];
  onDetail: (tripId: string) => void;
  onCreate: (prefill: ChuyenLichPrefill) => void;
};

export function ChuyenLich({
  trips,
  xeOptions,
  taixeOptions,
  onDetail,
  onCreate,
}: ChuyenLichProps) {
  const {
    ngayISO,
    mode,
    hasTrips,
    lanes,
    lichWindow,
    setMode,
    setNgay,
    createFor,
    handleTrackClick,
  } = useChuyenLich({ trips, xeOptions, taixeOptions, onCreate });

  const soCot = lichWindow.hours.length;
  const laneTemplate = `${LANE_COL_WIDTH}px 1fr`;
  const hourTemplate = `repeat(${soCot}, minmax(${HOUR_CELL_WIDTH}px, 1fr))`;
  const minWidth = LANE_COL_WIDTH + soCot * HOUR_CELL_WIDTH;
  const trackStyle = {
    ...TRACK_STYLE,
    backgroundSize: `calc(100% / ${soCot}) 100%, calc(100% / ${soCot * 2}) 100%`,
  };

  return (
    <section
      className="table-card grid gap-3 p-4 min-[641px]:px-5 min-[641px]:py-[18px]"
      aria-label="Lịch điều phối tài nguyên"
    >
      <h2 className="sr-only">Lịch điều phối tài nguyên</h2>

      <div className="lich-bar flex flex-wrap items-center justify-between gap-2.5">
        <DatePicker
          id="lichNgay"
          value={ngayISO}
          onChange={setNgay}
          icon="i-calendar"
          clearable={false}
          placeholder="Chọn ngày"
          className="w-[190px]"
        />

        <div className="cv-switch" role="group" aria-label="Nhóm tài nguyên">
          <button
            type="button"
            className={`cv-switch-btn${mode === "taixe" ? " is-active" : ""}`}
            aria-pressed={mode === "taixe"}
            onClick={() => setMode("taixe")}
          >
            Theo tài xế
          </button>
          <button
            type="button"
            className={`cv-switch-btn${mode === "xe" ? " is-active" : ""}`}
            aria-pressed={mode === "xe"}
            onClick={() => setMode("xe")}
          >
            Theo xe
          </button>
        </div>
      </div>

      <div className="lich-legend flex flex-wrap gap-3" aria-hidden="true">
        {LEGEND.map((item) => (
          <span key={item.label} className={LEGEND_ITEM_CLASS}>
            <i className={`${LEGEND_DOT_CLASS} ${item.className}`} />
            {item.label}
          </span>
        ))}
      </div>

      <p className="lich-note text-[11.5px] text-[var(--slate-500)]">
        Bấm vào chuyến để mở chi tiết; bấm vào ô trống hoặc dấu + để xếp chuyến
        mới. Mỗi ô trên trục là 1 giờ (cuộn ngang để xem đủ giờ); ô trống nghĩa là
        tài nguyên đang rảnh trong khung giờ đó.
      </p>

      {hasTrips ? (
        <div
          className="scroll-area overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]"
          role="region"
          aria-label="Lịch phân công theo khung giờ (cuộn ngang để xem đủ giờ)"
          tabIndex={0}
        >
          <div className="w-full" style={{ minWidth }}>
            <div
              className="grid border-b border-[var(--border)]"
              style={{ gridTemplateColumns: laneTemplate }}
            >
              <span className="py-2 pl-3 text-left text-[10.5px] font-bold text-[var(--slate-500)]">
                Tài nguyên
              </span>
              <div
                className="grid"
                style={{ gridTemplateColumns: hourTemplate }}
              >
                {lichWindow.hours.map((hour) => (
                  <span
                    key={hour}
                    className="border-l border-[var(--border-soft)] py-2 text-center text-[10.5px] font-bold text-[var(--slate-500)]"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>

            {lanes.map((lane) => (
              <div
                key={lane.id}
                className="grid border-b border-[var(--border-soft)] last:border-b-0"
                style={{ gridTemplateColumns: laneTemplate }}
              >
                <div className="grid content-center gap-1 border-r border-[var(--border-soft)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={LANE_NAME_CLASS}>{lane.name}</span>
                    <button
                      type="button"
                      className={`${ADD_BTN_CLASS}${lane.none ? ADD_BTN_NONE_CLASS : ""}`}
                      aria-label={
                        lane.none
                          ? "Phân công chuyến chưa gán tài nguyên"
                          : `Xếp chuyến cho ${lane.name}`
                      }
                      onClick={() => createFor(lane)}
                    >
                      <Icon
                        name={
                          lane.none
                            ? mode === "xe"
                              ? "i-car"
                              : "i-users"
                            : "i-plus"
                        }
                      />
                    </button>
                  </div>
                  <span className={LANE_META_CLASS}>{lane.metaLabel}</span>
                </div>
                <div
                  className={TRACK_CLASS}
                  style={trackStyle}
                  onClick={(event) => handleTrackClick(event, lane)}
                >
                  {lane.trips.map((trip) => (
                    <button
                      key={trip.id}
                      type="button"
                      className={`${BLOCK_BASE_CLASS} ${BLOCK_CLASS[trip.trangThai]}`}
                      style={{
                        left: `${trip.left.toFixed(2)}%`,
                        width: `${trip.width.toFixed(2)}%`,
                      }}
                      title={trip.title}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDetail(trip.id);
                      }}
                    >
                      <span className="text-[11px] font-extrabold">
                        {trip.ma}
                      </span>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px]">
                        {trip.tuyenNgan}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="state-empty">
          <span className="state-empty-icon" aria-hidden="true">
            <Icon name="i-calendar" className="icon" />
          </span>
          <h3>Ngày này chưa có chuyến nào</h3>
          <p>
            Chọn ngày khác ở ô chọn ngày phía trên để xem lịch, hoặc bấm Tạo
            chuyến để xếp chuyến mới cho ngày đang xem.
          </p>
        </div>
      )}
    </section>
  );
}
