import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { useManager } from "@/context/ManagerContext";
import { Badge } from "@/components/ui/badge";
const Interviews = () => {
  const { interviews } = useManager();

  function getStatusBadge(status: string) {
    if (status === "Chờ xác nhận") {
      return <Badge className="bg-yellow-50 text-yellow-700">{status}</Badge>;
    }

    if (status === "Hoàn thành") {
      return <Badge className="bg-blue-50 text-blue-700">{status}</Badge>;
    }

    if (status === "Không đạt") {
      return <Badge className="bg-red-50 text-red-700">{status}</Badge>;
    }

    return <Badge>{status}</Badge>;
  }

  return (
    <div className="p-6 space-y-6">
      <Link to="/manager/dashboard">
        <Button variant="secondary" className="mb-4">
          Quay lại Dashboard
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">Lịch Phỏng Vấn</h1>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
          <TabsTrigger value="scored">Đã chấm</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ứng viên</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Ngày PV</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{getStatusBadge(row.status)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="primary">Chấm điểm</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-125">
                          <DialogHeader>
                            <DialogTitle>Đánh giá ứng viên</DialogTitle>
                          </DialogHeader>

                          {/* Khối xám thông tin ứng viên */}
                          <div className="bg-muted p-4 rounded-md mt-2">
                            <p className="font-semibold text-lg">{row.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Ứng tuyển: {row.role}
                            </p>
                          </div>

                          {/* Khu vực đánh giá Slider */}
                          <div className="space-y-6 py-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">
                                    Kỹ năng chuyên môn
                                  </span>
                                </div>
                                <span className="text-sm font-bold">8/10</span>
                              </div>
                              <Slider defaultValue={[8]} max={10} step={1} />
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">
                                    Kỹ năng mềm
                                  </span>
                                </div>
                                <span className="text-sm font-bold">7/10</span>
                              </div>
                              <Slider defaultValue={[7]} max={10} step={1} />
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">
                                    Thái độ văn hoá
                                  </span>
                                </div>
                                <span className="text-sm font-bold">9/10</span>
                              </div>
                              <Slider defaultValue={[9]} max={10} step={1} />
                            </div>
                          </div>

                          {/* Kết quả Buttons */}
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-3">Kết Quả</p>
                            <div className="grid grid-cols-2 gap-4">
                              <Button
                                className="h-16 text-lg border-2 border-green-500 bg-green-500 text-green-700 hover:bg-green-100 hover:text-green-800"
                                variant="primary"
                              >
                                Đạt
                              </Button>
                              <Button
                                className="h-16 text-lg border-2 border-red-500 bg-red-500 text-red-700 hover:bg-red-100 hover:text-red-800"
                                variant="primary"
                              >
                                Không đạt
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="scored">
          <p>Đây là tab Đã chấm điểm.</p>
        </TabsContent>
        <TabsContent value="all">
          <p>Đây là tab Tất cả lịch phỏng vấn.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Interviews;
