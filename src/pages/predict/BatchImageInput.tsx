import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Descriptions,
  Form,
  message,
  Modal,
  Select,
  Slider,
  Spin,
  Table,
  Tabs,
  Tag,
  theme,
  Upload,
  type UploadFile,
  type UploadProps,
} from "antd";
import type { ColumnType } from "antd/es/table";
import axios from "axios";
import { saveAs } from "file-saver";
import { DirectboxReceive, DocumentText } from "iconsax-react";
import { unparse } from "papaparse";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const { Dragger } = Upload;

interface PredictionResult {
  fileName: string;
  label: number;
  label_name: string;
  confidence: number;
  probs: number[];
  error?: string;
  imageUrl?: string;
  advice?: string;
}

interface Model {
  key: string;
  name: string;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent === 0) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "12px", fontWeight: "bold" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function BatchImageInput() {
  const [model, setModel] = useState<string>();
  const [threshold, setThreshold] = useState(80);
  const thresholdRef = useRef(80);
  thresholdRef.current = threshold;

  const location = useLocation();
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [results, setResults] = useState<PredictionResult[] | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adviceModalOpen, setAdviceModalOpen] = useState(false);
  const [selectedAdvice, setSelectedAdvice] = useState<{
    fileName: string;
    advice: string;
  } | null>(null);

  const handleAdviceClick = (record: PredictionResult) => {
    if (record.advice) {
      setSelectedAdvice({ fileName: record.fileName, advice: record.advice });
      setAdviceModalOpen(true);
    }
  };

  const columns: ColumnType<PredictionResult>[] = [
    {
      key: "fileName",
      title: "File Name",
      dataIndex: "fileName",
      sorter: (a, b) => a.fileName.localeCompare(b.fileName),
    },
    {
      key: "label",
      title: "Deficiency Type",
      dataIndex: "label",
      render: (value, record) => {
        if (value === -1) return <Tag color="default">Error</Tag>;

        const name = record.label_name;
        let color = "default";
        if (name === "N") color = "blue";
        if (name === "P") color = "purple";
        if (name === "K") color = "orange";

        return <Tag color={color}>{name}</Tag>;
      },
      filters: [
        { text: "Nitrogen (N)", value: "N" },
        { text: "Phosphorus (P)", value: "P" },
        { text: "Potassium (K)", value: "K" },
      ],
      onFilter: (value, record) => record.label_name === value,
    },
    {
      key: "confidence",
      title: "Confidence",
      dataIndex: "confidence",
      render: (value) => (value ? `${(value * 100).toFixed(2)}%` : "--"),
      sorter: (a, b) => a.confidence - b.confidence,
    },
    {
      key: "advice",
      title: "Advice",
      dataIndex: "advice",
      render: (text, record) => {
        if (!text) return "-";
        const truncated =
          text.length > 50 ? text.substring(0, 50) + "..." : text;
        return (
          <span
            className="text-green-600 text-xs cursor-pointer hover:text-green-700 hover:underline"
            onClick={() => handleAdviceClick(record)}
            title="Click to view full advice"
          >
            {truncated}
          </span>
        );
      },
    },
    {
      key: "error",
      title: "Note",
      dataIndex: "error",
      render: (text) =>
        text ? <span className="text-red-500 text-xs">{text}</span> : "Success",
    },
  ];

  useEffect(() => {
    if (location.state?.model_key) {
      setModel(location.state.model_key);
    }
  }, [location.state]);

  const {
    data: models = [],
    isLoading: isModelsLoading,
    error: modelsError,
  } = useQuery<Model[]>({
    queryKey: ["models"],
    queryFn: async () => {
      console.log("Fetching models from backend...");

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/models`
        );
        console.log("Models API Response:", res.data);

        const data = res.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.models)) return data.models;

        return [];
      } catch (err) {
        console.error("Failed to fetch models:", err);
        throw err;
      }
    },
    retry: 1,
  });

  useEffect(() => {
    if (modelsError) {
      message.error(
        "Failed to load AI models. Please check backend connection."
      );
    }
  }, [modelsError]);

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      const thresholdValue = thresholdRef.current / 100;
      return axios
        .post(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/predict-batch-zip/${model}?threshold=${thresholdValue}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        const CONFIDENCE_THRESHOLD = thresholdRef.current / 100;

        const filteredResults = data.map((item) => {
          if (item.confidence < CONFIDENCE_THRESHOLD) {
            return {
              ...item,
              label: -1,
              label_name: "Uncertain",
              advice: undefined,
            };
          }
          return item;
        });

        setResults(filteredResults);
        setIsModalOpen(true);

        const uncertainCount = filteredResults.filter(
          (r) => r.label_name === "Uncertain"
        ).length;
        const successCount = filteredResults.length - uncertainCount;
        messageApi.success(
          `Processed ${successCount}/${data.length} images successfully! ${
            uncertainCount > 0 ? `${uncertainCount} uncertain.` : ""
          }`
        );
      } else {
        messageApi.error("Invalid response format from server.");
      }
    },

    onError: (error) => {
      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : "An unexpected error occurred";
      messageApi.error(`Batch processing failed: ${errorMsg}`);
    },
  });

  const handlePredict = () => {
    if (fileList.length === 0) {
      messageApi.warning("Please upload a ZIP file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj as Blob);
    mutate(formData);
  };

  const exportCSV = () => {
    if (!results) return;
    const cleanData = results.map(
      ({ fileName, label_name, confidence, advice, error }) => ({
        FileName: fileName,
        Label: label_name,
        Confidence: confidence,
        Advice: advice,
        Note: error || "Success",
      })
    );

    const csv = unparse(cleanData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `prediction_results_${new Date().getTime()}.csv`);
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);

    if (newFileList.length > 0) {
      setResults(undefined);
    }
  };

  const handleReset = () => {
    setResults(undefined);
    setFileList([]);
    setIsModalOpen(false);
  };

  const stats = results
    ? {
        total: results.length,
        N: results.filter((r) => r.label_name === "N").length,
        P: results.filter((r) => r.label_name === "P").length,
        K: results.filter((r) => r.label_name === "K").length,
        error: results.filter((r) => r.label === -1).length,
      }
    : { total: 0, N: 0, P: 0, K: 0, error: 0 };

  const pieData = [
    { name: "Nitrogen (N)", value: stats.N, color: "#1890ff" },
    { name: "Phosphorus (P)", value: stats.P, color: "#722ed1" },
    { name: "Potassium (K)", value: stats.K, color: "#fa8c16" },
    { name: "Error", value: stats.error, color: "#d9d9d9" },
  ].filter((item) => item.value > 0);

  return (
    <>
      {contextHolder}
      <Spin
        spinning={isPending}
        fullscreen
        tip="Processing batch images... This may take a while."
      />

      {/* --- Modal Kết Quả --- */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <DocumentText size="24" color={token.colorPrimary} variant="Bulk" />
            <span>Batch Prediction Results</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        footer={[
          <Button key="export" onClick={exportCSV} disabled={!results}>
            Export CSV
          </Button>,
          <Button key="ok" type="primary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {results && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Detailed Table",
                children: (
                  <Table
                    dataSource={results}
                    columns={columns}
                    rowKey="fileName"
                    pagination={{ pageSize: 6 }}
                    size="small"
                    scroll={{ y: 400 }}
                  />
                ),
              },
              {
                key: "2",
                label: "Visual Statistics",
                children: (
                  <div className="flex flex-col items-center py-4">
                    <h3 className="text-lg font-medium mb-2 text-gray-700">
                      Distribution of Predicted Deficiency Types
                    </h3>

                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            labelLine={false}
                            label={renderCustomizedLabel}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-center">
                      {/* Total */}
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-gray-500 text-xs uppercase">
                          Total
                        </div>
                        <div className="text-xl font-bold">{stats.total}</div>
                      </div>

                      {/* Nitrogen (N) - Blue */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-blue-600 text-xs uppercase">
                          Nitrogen (N)
                        </div>
                        <div className="text-xl font-bold text-blue-700">
                          {stats.N}
                        </div>
                      </div>

                      {/* Phosphorus (P) - Purple */}
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="text-purple-600 text-xs uppercase">
                          Phosphorus (P)
                        </div>
                        <div className="text-xl font-bold text-purple-700">
                          {stats.P}
                        </div>
                      </div>

                      {/* Potassium (K) - Orange */}
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="text-orange-600 text-xs uppercase">
                          Potassium (K)
                        </div>
                        <div className="text-xl font-bold text-orange-700">
                          {stats.K}
                        </div>
                      </div>
                      {/* Error - Gray */}
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-gray-500 text-xs uppercase">
                          Uncertain
                        </div>
                        <div className="text-xl font-bold text-gray-700">
                          {stats.error}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>

      {/* --- Modal AI Advice --- */}
      <Modal
        title={`AI Advice - ${selectedAdvice?.fileName || ""}`}
        open={adviceModalOpen}
        onCancel={() => setAdviceModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setAdviceModalOpen(false)}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {selectedAdvice?.advice || "No advice available."}
          </p>
        </div>
      </Modal>

      {/* --- Giao Diện Chính --- */}
      <div className="flex gap-6 pt-8 items-start max-w-6xl mx-auto">
        <div className="w-8/12 space-y-6">
          <div className="rounded-2xl shadow-lg shadow-gray-200/50 bg-white p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Configuration
            </h3>
            <Form layout="vertical">
              <Form.Item label={`Confidence Threshold: ${threshold}%`}>
                <Slider
                  min={1}
                  max={100}
                  onChange={(value) => setThreshold(value)}
                  value={threshold}
                  marks={{
                    0: "0%",
                    25: "25%",
                    50: "50%",
                    75: "75%",
                    100: "100%",
                  }}
                />
              </Form.Item>
              <Form.Item label="Select AI Model">
                <Select
                  value={model}
                  onChange={(value) => setModel(value)}
                  options={models.map((m) => ({
                    label: m.name,
                    value: m.key,
                  }))}
                  placeholder="Select a model"
                  size="large"
                  loading={isModelsLoading}
                  disabled={isModelsLoading || models.length === 0}
                />
              </Form.Item>
            </Form>
          </div>

          {/* Vùng Upload ZIP */}
          <div className="rounded-2xl shadow-lg shadow-gray-200/50 bg-white p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Data Upload
            </h3>
            <Dragger
              fileList={fileList}
              onChange={handleChange}
              beforeUpload={() => false}
              accept=".zip"
              maxCount={1}
              className="bg-gray-50/50!"
              height={200}
              onRemove={() => {
                setFileList([]);
                setResults(undefined);
              }}
            >
              <p className="ant-upload-drag-icon">
                <DirectboxReceive
                  size="48"
                  color={token.colorPrimary}
                  variant="Bulk"
                />
              </p>
              <p className="ant-upload-text text-gray-600 font-medium">
                Click or drag ZIP file to this area
              </p>
              <p className="ant-upload-hint text-gray-400 text-sm px-8">
                Please upload a single .zip file containing multiple rice leaf
                images.
                <br />
                (Max size: 50MB recommended)
              </p>
            </Dragger>
          </div>
        </div>

        <div className="w-4/12 sticky top-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Batch Summary</h3>

            <Descriptions
              column={1}
              size="small"
              className="my-4"
              items={[
                {
                  key: "1",
                  label: "Selected Model",
                  children: (
                    <Tag color="blue">
                      {models.find((m) => m.key === model)?.name || model}
                    </Tag>
                  ),
                },
                {
                  key: "2",
                  label: "File Name",
                  children: (
                    <span
                      className="font-medium truncate block max-w-[150px]"
                      title={fileList[0]?.name}
                    >
                      {fileList[0]?.name || "N/A"}
                    </span>
                  ),
                },
                {
                  key: "3",
                  label: "Status",
                  children: results ? (
                    <Tag color="success">Analysis Done</Tag>
                  ) : (
                    <Tag color="processing">Waiting</Tag>
                  ),
                },
              ]}
            />

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Button
                size="large"
                type="primary"
                block
                onClick={handlePredict}
                loading={isPending}
                disabled={fileList.length === 0}
                icon={<DirectboxReceive size="20" />}
                className="h-12 font-medium"
                aria-label="Start Batch Processing"
                title="Start Batch Processing"
              >
                Start Batch Processing
              </Button>

              {results && (
                <Button
                  size="large"
                  onClick={() => setIsModalOpen(true)}
                  block
                  aria-label="View Results"
                  title="View Results"
                >
                  View Results
                </Button>
              )}

              <Button
                size="large"
                onClick={handleReset}
                block
                type="text"
                className="text-gray-500"
                aria-label="Clear All"
                title="Clear All"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
