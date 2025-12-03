import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Col,
  Row,
  Statistic,
  theme,
  Typography,
  type StatisticProps,
  Divider,
  Tag,
} from "antd";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUp,
  Award,
  Cpu,
  DocumentText,
  People,
  Star1,
  TickCircle,
  Cloud,
} from "iconsax-react";
import CountUp from "react-countup";

const { Title, Paragraph, Text } = Typography;

const formatter: StatisticProps["formatter"] = (value: number | string) => (
  <CountUp end={Number(value)} separator="," />
);

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function About() {
  const { token } = theme.useToken();

  const { data } = useQuery<
    {
      id: number;
      input_data: any;
      model_key: string;
      model_name: string;
      predictions: any;
      timestamp: string;
    }[]
  >({
    queryKey: ["history"],
    queryFn: () =>
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/history`)
        .then((res) => res.data),
    staleTime: 0,
  });

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      {/* --- Header Section --- */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="inline-block mb-4 p-3 rounded-full bg-green-100"
        >
          <Cloud size="48" color={token.colorSuccess} variant="Bulk" />
        </motion.div>

        <motion.h1
          className="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Rice Leaf Nutrient Deficiency{" "}
          <span className="text-green-600">Prediction</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paragraph className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Empowering agriculture with Artificial Intelligence. Our advanced
            system accurately diagnoses rice leaf nutrient deficiencies, helping
            farmers maximize crop yields and ensure food security.
          </Paragraph>
        </motion.div>
      </motion.div>

      {/* --- Statistics Section --- */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        {[
          {
            title: "Supported Models",
            value: 4,
            icon: Cpu,
            color: token.colorPrimary,
          },
          {
            title: "Average Accuracy",
            value: 95,
            suffix: "%",
            icon: ArrowUp,
            color: token.colorSuccess,
          },
          {
            title: "Total Predictions",
            value: data ? data.length : 0,
            icon: Activity,
            color: token.colorWarning,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <Statistic
              title={
                <span className="text-gray-500 font-medium">{stat.title}</span>
              }
              value={stat.value}
              precision={stat.title.includes("Accuracy") ? 1 : 0}
              suffix={stat.suffix}
              styles={{
                content: {
                  color: stat.color,
                  fontWeight: "bold",
                  fontSize: "2.5rem",
                },
              }}
              prefix={
                <stat.icon
                  size="32"
                  color={stat.color}
                  variant="Bulk"
                  className="mr-2 opacity-80"
                />
              }
              formatter={formatter}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* --- Main Content Grid --- */}
      <Row gutter={[32, 32]}>
        {/* Left Column: Overview & Team */}
        <Col xs={24} lg={14} className="space-y-8">
          {/* Project Overview */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-green-500"
          >
            <div className="flex items-center mb-6">
              <DocumentText
                size="32"
                className="text-green-600 mr-3"
                variant="Bulk"
              />
              <Title level={3} className="m-0!">
                Project Overview
              </Title>
            </div>
            <Paragraph className="text-gray-600 text-lg leading-relaxed">
              Rice Leaf Nutrient Deficiency, focusing on key nutrients like{" "}
              <Text strong> Nitrogen (N) </Text>,{" "}
              <Text strong>Phosphorus (P)</Text>, and{" "}
              <Text strong>Potassium (K)</Text>.
            </Paragraph>
            <Paragraph className="text-gray-600 text-lg leading-relaxed">
              Traditional manual identification is time-consuming and prone to
              error. Our project leverages state-of-the-art{" "}
              <Text strong>Deep Learning</Text> techniques to automate this
              process, providing rapid and reliable nutrient deficiency
              detection from simple leaf images.
            </Paragraph>
          </motion.div>

          {/* Development Team */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-linear-to-br from-blue-50 to-white rounded-2xl shadow-md p-8"
          >
            <div className="flex items-center mb-6">
              <People size="32" className="text-blue-600 mr-3" variant="Bulk" />
              <Title level={3} className="m-0!">
                Our Team
              </Title>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Award size="40" className="text-blue-600" variant="Bulk" />
              </div>
              <div>
                <Title level={4} className="mb-1 text-blue-800">
                  Group 2 - CS406
                </Title>
                <Text className="text-gray-500 block mb-4 font-medium">
                  University of Information Technology (UIT)
                </Text>
                <Paragraph className="text-gray-600">
                  We are a dedicated team of computer science students
                  passionate about applying AI to solve real-world problems.
                  This project represents our final capstone effort to bridge
                  the gap between technology and agriculture.
                </Paragraph>
              </div>
            </div>
          </motion.div>
        </Col>

        {/* Right Column: Features & Objectives */}
        <Col xs={24} lg={10} className="space-y-8">
          {/* Key Features */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-md p-8"
          >
            <div className="flex items-center mb-6">
              <Star1
                size="32"
                className="text-yellow-500 mr-3"
                variant="Bulk"
              />
              <Title level={3} className="m-0!">
                Key Features
              </Title>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Multi-Model Analysis",
                  desc: "Compare results from Xception, ResNet50, EfficientNet, and MobileNet.",
                  color: "blue",
                },
                {
                  title: "Instant Diagnosis",
                  desc: "Get results in seconds via uploaded images.",
                  color: "green",
                },
                {
                  title: "AI Consultant",
                  desc: "Receive treatment advice powered by GenAI.",
                  color: "purple",
                },
                {
                  title: "History Tracking",
                  desc: "Review past diagnoses and trends.",
                  color: "orange",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TickCircle
                    size="24"
                    className={`text-${feature.color}-500 mr-3 mt-1 shrink-0`}
                    variant="Bold"
                  />
                  <div>
                    <Text strong className="block text-base">
                      {feature.title}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      {feature.desc}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Objectives */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-md p-8"
          >
            <Title level={4} className="mb-4 text-gray-800">
              Project Goals
            </Title>
            <div className="flex flex-wrap gap-2">
              {[
                "Accuracy",
                "Speed",
                "Usability",
                "Scalability",
                "Innovation",
              ].map((tag, i) => (
                <Tag
                  key={i}
                  color="geekblue"
                  className="px-3 py-1 text-sm rounded-full"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* --- Technical Architecture (Models) --- */}
      <motion.div
        className="mt-16"
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <Divider>
          <Title level={3} className="text-gray-400 font-light">
            Powered By
          </Title>
        </Divider>

        <Row gutter={[24, 24]} className="mt-8">
          {[
            {
              name: "Xception",
              desc: "Deep learning model utilizing depthwise separable convolutions for high efficiency and accuracy in nutrient deficiency detection.",
              color: "border-purple-200",
              bg: "bg-purple-50",
            },
            {
              name: "ResNet50",
              desc: "Residual Network with 50 layers using skip connections to enable training of very deep networks for robust feature extraction.",
              color: "border-blue-200",
              bg: "bg-blue-50",
            },
            {
              name: "EfficientNetB0",
              desc: "Compound scaling model balancing network depth, width, and resolution for optimal performance and efficiency.",
              color: "border-green-200",
              bg: "bg-green-50",
            },
            {
              name: "MobileNetV3",
              desc: "Lightweight architecture optimized for mobile and edge devices, delivering fast predictions without sacrificing accuracy.",
              color: "border-orange-200",
              bg: "bg-orange-50",
            },
          ].map((model, index) => (
            <Col xs={24} md={8} key={index}>
              <motion.div
                whileHover={{ y: -5 }}
                className={`h-full p-6 rounded-xl border ${model.color} ${model.bg}`}
              >
                <Title level={4} className="mb-3">
                  {model.name}
                </Title>
                <Paragraph className="text-gray-600 m-0">
                  {model.desc}
                </Paragraph>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* --- Disclaimer --- */}
      <motion.div
        className="mt-16 mb-8"
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <Alert
          title="Disclaimer"
          description="This AI system is designed for educational and assistive purposes. While highly accurate, results should be verified by agricultural experts before taking large-scale action. We are not liable for crop losses due to misuse."
          type="warning"
          showIcon
          className="rounded-lg border-yellow-200 bg-yellow-50"
        />
      </motion.div>
    </div>
  );
}
