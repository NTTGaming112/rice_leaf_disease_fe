import { Tabs } from "antd";
import Import from "./BatchImageInput";
import ManualInput from "./ImageInput";
import { useLocation } from "react-router-dom";

function Predict() {
  const location = useLocation();

  return (
    <div>
      <h2 className="text-4xl font-semibold mb-8">
        Rice Leaf Nutrient Deficiency Prediction
      </h2>

      <Tabs
        size="large"
        defaultActiveKey={location.state?.input_data.length > 1 ? "2" : "1"}
        items={[
          {
            key: "1",
            label: "Manual Input",
            children: <ManualInput />,
          },
          {
            key: "2",
            label: "Import",
            children: <Import />,
          },
        ]}
      />
    </div>
  );
}

export default Predict;
