import { Avatar, Button, Drawer, Input, theme, Result } from "antd";
import {
  Aave,
  Add,
  AttachCircle,
  Box1,
  Clock,
  HambergerMenu,
  Icon,
  SearchNormal1,
  Setting2,
} from "iconsax-react";
import React, { useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import About from "./pages/About";
import HistoryPage from "./pages/History";
import Predict from "./pages/predict";

const sidebarItems = [
  {
    label: "About",
    icon: Aave,
    href: "/",
  },
  {
    label: "Predictions",
    icon: Box1,
    href: "/predict",
  },
  {
    label: "History",
    icon: Clock,
    href: "/history",
  },
];

const App: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex bg-gray-100">
        <aside className="w-72 p-4 max-lg:hidden">
          <h1 className="mb-8 text-lg font-medium flex items-center">
            <AttachCircle
              className="size-12 mr-2"
              color="black"
              variant="Bold"
            />
            <span>Rice Leaf Disease Predictor</span>
          </h1>

          <div className="p-2 space-y-4">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;

              const Icon = item.icon as Icon;

              return (
                <Link
                  key={item.href}
                  className={`flex items-center p-1.5 rounded-2xl cursor-pointer transition-all ${
                    isActive ? "bg-blue-500 text-white shadow-lg" : ""
                  }`}
                  to={item.href}
                >
                  <div
                    className={`flex items-center justify-center rounded-xl size-9 mr-4 transition-all ${
                      isActive ? "bg-white/90" : "bg-white shadow-lg"
                    }`}
                  >
                    <Icon
                      className="size-5"
                      color={token.colorPrimary}
                      variant="Bold"
                    />
                  </div>
                  <span className="drop-shadow-lg">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="md:px-8 px-4 pt-3 md:pt-4 flex-1 h-screen overflow-y-auto">
          <div className="flex items-center justify-between mb-8 py-2">
            <div className="flex items-center gap-4">
              <Button
                size="large"
                shape="circle"
                type="primary"
                className="shadow-xl! lg:hidden! size-11!"
                onClick={() => setOpen(true)}
                icon={
                  <span>
                    <HambergerMenu className="size-6" color="white" />
                  </span>
                }
              />

              <div className="flex items-center max-lg:hidden">
                <Avatar
                  size={48}
                  src="https://avatar.iran.liara.run/public/boy?username=Group 2"
                />

                <div className="flex flex-col items-start ml-4">
                  <span className="text-lg">Group 2</span>
                  <span className="text-gray-500 text-sm">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 max-lg:hidden">
              <Input
                className="w-96!"
                placeholder="Search..."
                size="large"
                variant="filled"
                suffix={
                  <span>
                    <SearchNormal1 className="size-4" color="black" />
                  </span>
                }
              />

              <div className="flex items-center gap-4">
                {/* <Button
									shape='circle'
									color='default'
									variant='filled'
									size='large'
									icon={
										<span>
											<Brush color='black' className='size-4' />
										</span>
									}
								/> */}

                <Button
                  shape="circle"
                  color="default"
                  variant="filled"
                  size="large"
                  icon={
                    <span>
                      <Setting2 color="black" className="size-4" />
                    </span>
                  }
                />
              </div>
            </div>
          </div>

          <div className="pb-32">
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route
                path="*"
                element={
                  <Result
                    status="404"
                    title="404"
                    subTitle="Sorry, the page you visited does not exist."
                    extra={
                      <Button type="primary" onClick={() => navigate("/")}>
                        Back Home
                      </Button>
                    }
                  />
                }
              />
            </Routes>
          </div>

          <footer className="pb-6 text-center text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} Rice Leaf Disease Predictor. All rights
              reserved.
            </p>
          </footer>
        </div>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement="left"
        title={
          <div className="flex items-center">
            <h1 className="text-lg font-medium flex items-center">
              <AttachCircle
                className="size-12 mr-2"
                color="black"
                variant="Bold"
              />
              <span>Rice Leaf Disease Predictor</span>
            </h1>

            <Button
              className="ml-auto"
              type="text"
              onClick={() => setOpen(false)}
              icon={
                <span>
                  <Add className="size-7 rotate-45" color="gray" />
                </span>
              }
            />
          </div>
        }
        closeIcon={false}
      >
        <div className="space-y-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;

            const Icon = item.icon as Icon;

            return (
              <Link
                key={item.href}
                className={`flex items-center p-1.5 rounded-2xl cursor-pointer transition-all ${
                  isActive ? "bg-blue-500! text-white!" : "text-black!"
                }`}
                to={item.href}
                onClick={() => setOpen(false)}
              >
                <div
                  className={`flex items-center justify-center rounded-xl size-9 mr-4 transition-all ${
                    isActive
                      ? "bg-white/90!"
                      : "bg-white! border border-gray-200"
                  }`}
                >
                  <Icon
                    className="size-5"
                    color={token.colorPrimary}
                    variant="Bold"
                  />
                </div>
                <span className="drop-shadow-lg">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </Drawer>
    </>
  );
};

export default App;
