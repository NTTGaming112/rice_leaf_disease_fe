import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Modal, Table, Tag, message, Tooltip } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  FileImageOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import { useState } from "react";

interface PredictionRecord {
  id: number;
  fileName: string;
  label: number;
  label_name: string;
  confidence: number;
  threshold: number;
  probs: number[];
  advice: string;
  image_data?: string;
  model_key?: string;
  created_at: string;
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loadingImage, setLoadingImage] = useState(false);

  const handleDelete = (record: PredictionRecord) => {
    Modal.confirm({
      title: "Delete Prediction",
      content: `Are you sure you want to delete "${record.fileName}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/history/${record.id}`
          );
          message.success("Record deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["history"] });
        } catch (error) {
          message.error("Failed to delete record");
          console.error(error);
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one record to delete");
      return;
    }

    Modal.confirm({
      title: "Delete Multiple Predictions",
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected record(s)?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((id) =>
              axios.delete(`${import.meta.env.VITE_API_BASE_URL}/history/${id}`)
            )
          );
          message.success(
            `Successfully deleted ${selectedRowKeys.length} record(s)`
          );
          setSelectedRowKeys([]);
          queryClient.invalidateQueries({ queryKey: ["history"] });
        } catch (error) {
          message.error("Failed to delete some records");
          console.error(error);
        }
      },
    });
  };

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
    const modelNames: Record<string, string> = {
      xception: "Xception (base)",
      efficientnet: "EfficientNetB0",
      mobilenet: "MobileNetV3",
      minixception: "MiniXception",
      xception_eca: "MiniXception ECA",
    };

    const csvData = [
      {
        FileName: record.fileName,
        Label: record.label_name,
        Confidence: `${(record.confidence * 100).toFixed(2)}%`,
        Threshold: `${(record.threshold * 100).toFixed(0)}%`,
        Probs: record.probs.join(", "),
        Model: record.model_key
          ? modelNames[record.model_key] || record.model_key
          : "N/A",
        Advice: record.advice,
        CreatedAt: record.created_at,
      },
    ];
    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `prediction_${record.fileName}.csv`);
  };

  const downloadImage = async (record: PredictionRecord) => {
    try {
      let imageData = record.image_data;

      if (!imageData) {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/history/${record.id}/image`
        );
        imageData = response.data.image_data;
      }

      if (imageData) {
        const imageBlob = new Blob(
          [Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0))],
          { type: "image/jpeg" }
        );
        const fileNameWithoutExt = record.fileName.replace(/\.[^/.]+$/, "");
        saveAs(imageBlob, `${fileNameWithoutExt}.jpg`);
      }
    } catch (error) {
      message.error("Failed to download image");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">History of Predictions</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search by filename, label"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 400 }}
          />
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              Delete ({selectedRowKeys.length})
            </Button>
          )}
        </div>
      </div>

      <Table
        loading={isLoading}
        dataSource={filteredData}
        rowKey={(record) => record.id}
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
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
            title: "Model",
            dataIndex: "model_key",
            key: "model_key",
            render: (value: string) => {
              const modelNames: Record<string, string> = {
                xception: "Xception (base)",
                minixception: "MiniXception",
                xception_eca: "MiniXception ECA",
                efficientnet: "EfficientNetB0",
                mobilenet: "MobileNetV3",
              };
              return value ? modelNames[value] || value : "-";
            },
            filters: [
              { text: "Xception (base)", value: "xception" },
              { text: "MiniXception", value: "minixception" },
              { text: "MiniXception ECA", value: "xception_eca" },
              { text: "EfficientNetB0", value: "efficientnet" },
              { text: "MobileNetV3", value: "mobilenet" },
            ],
            onFilter: (value, record) => record.model_key === value,
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
                <Tooltip title="View">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={async () => {
                      setSelected(record);
                      if (!record.image_data) {
                        setLoadingImage(true);
                        try {
                          const response = await axios.get(
                            `${import.meta.env.VITE_API_BASE_URL}/history/${
                              record.id
                            }/image`
                          );
                          record.image_data = response.data.image_data;
                          setSelected({ ...record });
                        } catch (error) {
                          console.error("Failed to load image:", error);
                        } finally {
                          setLoadingImage(false);
                        }
                      }
                    }}
                  />
                </Tooltip>
                <Tooltip title="Export CSV">
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => exportCSV(record)}
                  />
                </Tooltip>
                <Tooltip title="Download Image">
                  <Button
                    size="small"
                    icon={<FileImageOutlined />}
                    onClick={() => downloadImage(record)}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                  />
                </Tooltip>
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
            <Button key="download" onClick={() => downloadImage(selected)}>
              Download Image
            </Button>,
          ]}
        >
          {loadingImage ? (
            <div className="mb-4 flex justify-center">
              <p>Loading image...</p>
            </div>
          ) : selected.image_data ? (
            <div className="mb-4 flex justify-center">
              <img
                src={`data:image/jpeg;base64,${selected.image_data}`}
                alt={selected.fileName}
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: "300px" }}
              />
            </div>
          ) : (
            <div className="mb-4 flex justify-center">
              <p>Image not available</p>
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
            <strong>Threshold:</strong> {(selected.threshold * 100).toFixed(0)}%
          </p>
          <p>
            <strong>Probs (N,P,K):</strong> {selected.probs.join(", ")}
          </p>
          {selected.model_key && (
            <p>
              <strong>Model:</strong>{" "}
              {{
                xception: "Xception (base)",
                minixception: "MiniXception",
                xception_eca: "MiniXception ECA",
                efficientnet: "EfficientNetB0",
                mobilenet: "MobileNetV3",
              }[selected.model_key] || selected.model_key}
            </p>
          )}
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
