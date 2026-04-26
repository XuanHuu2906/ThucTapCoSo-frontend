import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useManager } from "@/context/ManagerContext.tsx";
import { Link } from "react-router-dom";

const Reviews = () => {
  const { probation } = useManager();

  return (
    <div className="p-6 space-y-6">
      <Link to="/manager/dashboard">
        <Button variant="secondary" className="mb-4">
          Quay lại Dashboard
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">Đánh giá Thử Việc</h1>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Chuyên môn</TableHead>
              <TableHead>Ngày đáo hạn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {probation.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.dueDate}</TableCell>

                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Đánh giá</Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-150">
                      <DialogHeader>
                        <DialogTitle>Đánh giá năng lực: {row.name}</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 border p-4 rounded-md">
                            <p className="text-sm text-gray-500">KPI</p>
                            <p className="text-2xl font-semibold">95%</p>
                          </div>

                          <div className="bg-gray-50 border p-4 rounded-md">
                            <p className="text-sm text-gray-500">Chất lượng</p>
                            <p className="text-2xl font-semibold">Tốt</p>
                          </div>
                        </div>

                        <Textarea placeholder="Nhận xét..." />

                        <div className="flex justify-end gap-3">
                          <Button className="text-red-600">Chấm dứt</Button>
                          <Button>Đề xuất ký HĐ</Button>
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
    </div>
  );
};

export default Reviews;
