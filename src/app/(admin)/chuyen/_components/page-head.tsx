"use client";

import { Icon } from "@/components/icons/icon";

type ChuyenPageHeadProps = {
  onCreate: () => void;
};

export function ChuyenPageHead({ onCreate }: ChuyenPageHeadProps) {
  return (
    <header className="page-head">
      <div>
        <span className="page-head-eyebrow">Khu quản trị · Vận hành</span>
        <h1 className="page-head-title">Quản lý chuyến</h1>
      </div>
      <div className="page-head-action">
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          <Icon name="i-plus" />
          Tạo chuyến
        </button>
      </div>
    </header>
  );
}
