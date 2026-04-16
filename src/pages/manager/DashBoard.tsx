import {
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useManager } from "@/context/ManagerContext";
const DashboardManager = () => {
  const managerName = "Nguyễn Văn A";
  // Mock data
  const { interviews, probation } = useManager();
  const getDaysLeft = (date: string) => {
    const today = new Date();
    const due = new Date(date.split("/").reverse().join("-"));
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Xin chào, {managerName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Tổng quan công việc của bạn hôm nay
        </p>
      </div>

      {/* StatCards (Grid-cols-4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <Calendar className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PV sắp tới</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã phỏng vấn</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nhân viên TV</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ đánh giá</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2 Cột Nội Dung (Grid-cols-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột Trái: Lịch phỏng vấn sắp tới */}
        <Card className="border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Lịch phỏng vấn sắp tới
            </CardTitle>
            <Link to="/manager/interviews">
              <Button
                variant="primary"
                className="text-sm text-muted-foreground p-0 h-auto"
              >
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {interviews.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cột Phải: Chờ đánh giá thử việc */}
        <Card className="border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Chờ đánh giá thử việc
            </CardTitle>
            <Link to="/manager/reviews">
              <Button
                variant="primary"
                className="text-sm text-muted-foreground p-0 h-auto"
              >
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {probation.map((item) => {
                const daysLeft = getDaysLeft(item.dueDate);
                const isUrgent = daysLeft < 7;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-md font-semibold text-sm ${isUrgent ? "bg-red-100 text-red-600" : "bg-secondary text-secondary-foreground"}`}
                    >
                      Còn {daysLeft} ngày
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default DashboardManager;
