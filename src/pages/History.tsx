import { useQuery } from "@tanstack/react-query";
import { Button, Input, Modal, Table, Tag } from "antd";
import axios from "axios";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import { useState } from "react";

interface PredictionRecord {
  fileName: string;
  label: number;
  label_name: string;
  confidence: number;
  probs: number[];
  advice: string;
  image_data?: string;
  created_at: string;
}

export default function HistoryPage() {
  const { data, isLoading } = useQuery<PredictionRecord[]>({
    queryKey: ["history"],
    queryFn: () =>
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/history`)
        .then((res) => res.data),
    staleTime: 0,
  });

  const [selected, setSelected] = useState<PredictionRecord | null>(null);
  const [searchText, setSearchText] = useState("");

  const filteredData = Array.isArray(data)
    ? data.filter((record) => {
        const search = searchText.toLowerCase();
        return (
          record.fileName.toLowerCase().includes(search) ||
          record.label_name.toLowerCase().includes(search)
        );
      })
    : [];

  const exportCSV = (record: PredictionRecord) => {
    const csvData = [
      {
        FileName: record.fileName,
        Label: record.label_name,
        Confidence: record.confidence,
        Probs: record.probs.join(", "),
        Advice: record.advice,
        CreatedAt: record.created_at,
      },
    ];
    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `prediction_${record.fileName}.csv`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">History of Predictions</h2>
        <Input
          placeholder="Search by filename, label, advice, or date..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 400 }}
        />
      </div>

      <Table
        loading={isLoading}
        dataSource={filteredData}
        rowKey={(record) => record.fileName + record.created_at}
        columns={[
          {
            title: "File Name",
            dataIndex: "fileName",
            key: "fileName",
            sorter: (a, b) => a.fileName.localeCompare(b.fileName),
          },
          {
            title: "Label",
            dataIndex: "label_name",
            key: "label_name",
            render: (label: string) => {
              let color = "default";
              if (label === "N") color = "blue";
              if (label === "P") color = "purple";
              if (label === "K") color = "orange";
              return <Tag color={color}>{label}</Tag>;
            },
            sorter: (a, b) => a.label_name.localeCompare(b.label_name),
            filters: [
              { text: "Nitrogen (N)", value: "N" },
              { text: "Phosphorus (P)", value: "P" },
              { text: "Potassium (K)", value: "K" },
            ],
            onFilter: (value, record) => record.label_name === value,
          },
          {
            title: "Confidence",
            dataIndex: "confidence",
            key: "confidence",
            render: (value: number) => `${(value * 100).toFixed(2)}%`,
            sorter: (a, b) => a.confidence - b.confidence,
          },
          {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            render: (value: string) =>
              new Date(value).toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
            sorter: (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
            defaultSortOrder: "descend",
          },
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <div className="flex gap-2">
                <Button size="small" onClick={() => setSelected(record)}>
                  View
                </Button>
                <Button size="small" onClick={() => exportCSV(record)}>
                  Export CSV
                </Button>
              </div>
            ),
          },
        ]}
      />

      {selected && (
        <Modal
          open={!!selected}
          title={`Prediction Detail - ${selected.fileName}`}
          onCancel={() => setSelected(null)}
          footer={[
            <Button key="close" onClick={() => setSelected(null)}>
              Close
            </Button>,
            <Button key="export" onClick={() => exportCSV(selected)}>
              Export CSV
            </Button>,
          ]}
        >
          {selected.image_data && (
            <div className="mb-4 flex justify-center">
              <img
                src={`data:image/jpeg;base64,${selected.image_data}`}
                alt={selected.fileName}
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: "300px" }}
              />
            </div>
          )}
          <p>
            <strong>File Name:</strong> {selected.fileName}
          </p>
          <p>
            <strong>Label:</strong> {selected.label_name} ({selected.label})
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {(selected.confidence * 100).toFixed(2)}%
          </p>
          <p>
            <strong>Probs (N,P,K):</strong> {selected.probs.join(", ")}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(selected.created_at).toLocaleString("vi-VN")}
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="font-semibold text-blue-900 mb-2">AI Advice:</p>
            <p className="text-sm text-gray-700">
              {selected.advice || "No advice available."}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
