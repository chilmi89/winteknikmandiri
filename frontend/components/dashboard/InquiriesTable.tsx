"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  MessageCircle,
  RefreshCw,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchInquiries } from "@/lib/dashboard/api";
import { formatDateTime, initials, waChatLink } from "@/lib/dashboard/format";
import type { Inquiry } from "@/lib/dashboard/types";
import Badge, { statusLabel, statusTone } from "./Badge";
import { Button } from "./Button";
import DataTable, { type DataTableColumn } from "./DataTable";
import PageHeader from "./PageHeader";

const searchKeys = ["name", "phone", "service", "address", "notes"];

const statusOptions = [
  { value: "all", label: "Semua status" },
  { value: "pending", label: "Pending" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "batal", label: "Batal" },
];

function toCsv(rows: Inquiry[]): string {
  const header = [
    "ID",
    "Nama",
    "Telepon",
    "Layanan",
    "Alamat",
    "Catatan",
    "Status",
    "Dibuat",
  ];

  const escape = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const lines = rows.map((row) =>
    [
      row.id,
      row.name,
      row.phone,
      row.service,
      row.address,
      row.notes,
      row.status,
      row.created_at,
    ]
      .map(escape)
      .join(",")
  );

  return [header.map(escape).join(","), ...lines].join("\r\n");
}

export function InquiriesTable() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [status, setStatus] = useState("all");

  async function load() {
    setLoading(true);
    const result = await fetchInquiries();
    setRows(result.data);
    setOffline(result.offline);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    void fetchInquiries().then((result) => {
      if (!active) return;
      setRows(result.data);
      setOffline(result.offline);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(
    () =>
      status === "all"
        ? rows
        : rows.filter((row) => row.status.toLowerCase() === status),
    [rows, status]
  );

  function handleExport() {
    const blob = new Blob([toCsv(filteredRows)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `permohonan-wtm-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const columns: DataTableColumn<Inquiry>[] = [
    {
      key: "name",
      header: "Pelanggan",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center bg-[#0A2540]/6 text-[11px] font-bold text-[#0A2540]">
            {initials(row.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-[#0A2540]">
              {row.name}
            </span>
            <span className="block truncate text-[11px] text-[#0A2540]/45">
              {row.phone}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: "service",
      header: "Layanan",
      sortable: true,
      render: (row) => (
        <span className="block max-w-[190px] truncate">{row.service}</span>
      ),
    },
    {
      key: "address",
      header: "Alamat",
      hideOnMobile: true,
      render: (row) => (
        <span className="block max-w-[220px] truncate text-[#0A2540]/65">
          {row.address}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <Badge tone={statusTone(row.status)} dot>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Masuk",
      sortable: true,
      hideOnMobile: true,
      render: (row) => (
        <span className="text-xs whitespace-nowrap text-[#0A2540]/60">
          {formatDateTime(row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operasional"
        title="Permohonan Masuk"
        description="Semua permintaan konsultasi dan service AC dari formulir website. Balas lewat WhatsApp atau perbarui statusnya."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => void load()}
              icon={
                <RefreshCw
                  className={cn("size-4", loading && "animate-spin")}
                  aria-hidden="true"
                />
              }
            >
              Muat ulang
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExport}
              icon={<Download className="size-4" aria-hidden="true" />}
              disabled={filteredRows.length === 0}
            >
              Ekspor CSV
            </Button>
          </>
        }
      />

      {offline ? (
        <div className="dash-fade flex items-start gap-2.5 border border-[#B7791F]/25 bg-[#B7791F]/8 px-4 py-3 text-xs text-[#8A5A12]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            API backend belum terhubung — menampilkan data contoh. Jalankan{" "}
            <code className="bg-white/60 px-1">docker compose up -d</code> untuk
            data asli.
          </p>
        </div>
      ) : null}

      <DataTable
        data={filteredRows}
        columns={columns}
        searchKeys={searchKeys}
        pageSize={8}
        isLoading={loading}
        searchPlaceholder="Cari nama, telepon, atau layanan…"
        emptyTitle="Belum ada permohonan"
        emptyMessage="Permohonan baru dari formulir website akan otomatis muncul di sini."
        initialSort={{ key: "created_at", dir: "desc" }}
        filters={
          <label className="relative">
            <span className="sr-only">Filter status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full border border-[#0A2540]/12 bg-white px-3 pr-8 text-[13px] text-[#0A2540] transition-colors focus:border-[#A82020] focus:outline-none sm:w-auto"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        }
        toolbarActions={
          <span className="hidden items-center gap-1.5 text-[11px] text-[#0A2540]/45 sm:inline-flex">
            <SearchX className="size-3.5" aria-hidden="true" />
            {filteredRows.length} baris siap diekspor
          </span>
        }
        rowActions={(row) => (
          <a
            href={waChatLink(
              row.phone,
              `Halo ${row.name}, terima kasih telah menghubungi CV Win Teknik Mandiri.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Balas ${row.name} via WhatsApp`}
            title="Balas via WhatsApp"
            className="flex size-8 items-center justify-center border border-transparent text-[#0A2540]/45 transition-colors hover:border-[#0F7B5F]/25 hover:bg-[#0F7B5F]/8 hover:text-[#0B5C47]"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
          </a>
        )}
      />
    </div>
  );
}

export default InquiriesTable;
