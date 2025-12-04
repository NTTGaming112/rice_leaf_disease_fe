import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  message,
  Modal,
  Select,
  Spin,
  Upload,
  Alert,
  Slider,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState, useEffect, useRef } from "react";

interface Model {
  key: string;
  name: string;
}

export default function ImagePredict() {
  const [threshold, setThreshold] = useState(80);
  const thresholdRef = useRef(80);
  const [messageApi, contextHolder] = message.useMessage();
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageFile, setImageFile] = useState<File>();
  const [selectedModel, setSelectedModel] = useState<string>();
  const [result, setResult] = useState<{
    prediction: number;
    label: string;
    confidence?: number;
    advice?: string;
  }>();

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const { data: models = [], isLoading: isModelsLoading } = useQuery<Model[]>({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/models`
      );
      return res.data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const thresholdValue = thresholdRef.current / 100;
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/predict-image/${selectedModel}?threshold=${thresholdValue}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return res.data;
    },
    onSuccess: (data) => {
      const CONFIDENCE_THRESHOLD = thresholdRef.current / 100; // Convert percentage to decimal

      if (data.confidence < CONFIDENCE_THRESHOLD) {
        setResult({
          prediction: -1,
          label: "Uncertain",
          confidence: data.confidence,
          advice: undefined,
        });
      } else {
        setResult({
          prediction: data.label,
          label: data.label_name || "Unknown",
          confidence: data.confidence,
          advice: data.advice,
        });
      }
    },

    onError: (err) => {
      console.error(err);
      messageApi.error("Prediction failed. Check console for details.");
    },
  });

  const handleReset = () => {
    setResult(undefined);
    setImageFile(undefined);
    setImagePreview(undefined);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      {contextHolder}
      <Spin spinning={isPending} fullscreen />
      <Form
        layout="vertical"
        onFinish={() => {
          if (!imageFile)
            return messageApi.error("Please upload an image first!");
          // Gán threshold khi nhấn classify
          thresholdRef.current = threshold;
          mutate(imageFile);
        }}
      >
        {/* --- Confidence Threshold --- */}
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
            tooltip={{ open: false }}
          />
        </Form.Item>

        {/* --- Select Model --- */}
        <Form.Item label="Select AI Model">
          <Select
            placeholder="Select a model"
            value={selectedModel}
            onChange={setSelectedModel}
            loading={isModelsLoading}
            options={models.map((m) => ({
              label: m.name,
              value: m.key,
            }))}
          />
        </Form.Item>

        {/* --- Upload Image --- */}
        <Form.Item label="Upload Leaf Image">
          <Upload.Dragger
            maxCount={1}
            accept="image/*"
            beforeUpload={(file) => {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
              return false;
            }}
            onRemove={() => {
              setImageFile(undefined);
              setImagePreview(undefined);
            }}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#1677ff" }} />
            </p>
            <p className="ant-upload-text">Click or drag image here</p>
            <p className="ant-upload-hint">
              Supports: JPG, PNG. Max size: 5MB.
            </p>
          </Upload.Dragger>

          {imagePreview && (
            <div className="mt-4 text-center border p-2 rounded-lg relative">
              <Image
                src={imagePreview}
                alt="preview"
                height={200}
                className="rounded-lg object-contain"
              />
              <p className="text-gray-500 text-sm mt-2">{imageFile?.name}</p>
            </div>
          )}
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          disabled={!imageFile || isModelsLoading}
        >
          Classify Image
        </Button>
      </Form>
      {/* --- Result Modal --- */}
      <Modal
        open={!!result}
        title="Classification Result"
        onOk={handleReset}
        onCancel={handleReset}
        footer={[
          <Button key="close" type="primary" onClick={handleReset}>
            Close
          </Button>,
        ]}
      >
        {result && (
          <div className="space-y-4">
            {result.label === "Uncertain" ? (
              <div className="p-4 rounded-lg text-center bg-gray-50 border border-gray-300">
                <h3 className="text-lg font-bold text-gray-700">
                  Unable to Confidently Classify Image
                </h3>
                <p className="text-gray-600 mt-2">
                  Confidence too low (
                  {result.confidence !== undefined
                    ? (result.confidence * 100).toFixed(2)
                    : "0.00"}
                  %)
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please try again with a higher quality image or select a
                  different model.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-lg text-center bg-orange-50 border border-orange-200">
                  <h3 className="text-lg font-bold text-orange-700">
                    {result.label}
                  </h3>
                  <p className="text-gray-600">Nutrient Deficiency Detected</p>
                  {result.confidence !== undefined && (
                    <p className="text-sm text-gray-500 mt-2">
                      Confidence:{" "}
                      <span className="font-semibold">
                        {(result.confidence * 100).toFixed(2)}%
                      </span>
                    </p>
                  )}
                </div>
                {result.advice && (
                  <div>
                    <h4 className="font-semibold mb-2">AI Recommendation:</h4>
                    <Alert
                      title={result.advice}
                      type="warning"
                      showIcon
                      className="text-justify"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
