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
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState, useEffect } from "react";

interface Model {
  key: string;
  name: string;
}

export default function ImagePredict() {
  const [messageApi, contextHolder] = message.useMessage();
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageFile, setImageFile] = useState<File>();
  const [selectedModel, setSelectedModel] = useState<string>("cnn");
  const [result, setResult] = useState<{ prediction: number; label: string; advice?: string }>();

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

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/predict-image/${selectedModel}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return res.data;
    },
    onSuccess: (data) => {
      setResult({
        prediction: data.label,
        label: data.label_name || "Unknown",
        advice: data.advice,
      });
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

      <h2 className="text-2xl font-semibold mb-6 text-center">
        Rice Leaf Disease Classification
      </h2>

      <Form
        layout="vertical"
        onFinish={() => {
          if (!imageFile)
            return messageApi.error("Please upload an image first!");
          mutate(imageFile);
        }}
      >
        {/* --- Select Model --- */}
        <Form.Item label="Select AI Model">
          <Select
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
            <div className="p-4 rounded-lg text-center bg-orange-50 border border-orange-200">
              <h3 className="text-lg font-bold text-orange-700">
                {result.label}
              </h3>
              <p className="text-gray-600">Nutrient Deficiency Detected</p>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
