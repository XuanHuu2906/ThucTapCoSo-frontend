import { useState } from "react";
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
import { probationService } from "@/services/probation.service";

const ReviewDialog = ({ row, onReviewed }: { row: any; onReviewed: () => void }) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (recommendation: "terminate" | "sign_contract") => {
    try {
      setLoading(true);
      await probationService.submitEvaluationForProbation(String(row.id), {
        kpiScore: 95, // mocked KPI score
        comment,
        recommendation,
      });
      setOpen(false);
      onReviewed();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      alert("Đã xảy ra lỗi khi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Đánh giá</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
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

          <Textarea
            placeholder="Nhận xét của Quản lý..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="danger"
              disabled={loading}
              onClick={() => handleSubmit("terminate")}
            >
              Chấm dứt
            </Button>
            <Button
              disabled={loading}
              onClick={() => handleSubmit("sign_contract")}
            >
              Đề xuất ký HĐ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Reviews = () => {
  const { probation, setProbation } = useManager();

  // Chỉ lấy các nhân viên thử việc đang trong trạng thái 'probating'
  const ongoingProbations = probation.filter((p) => p.status === "probating");

  const handleReviewed = (id: number) => {
    // Đổi trạng thái thành 'pending_evaluation' (hoặc giá trị bất kỳ khác 'probating') thay vì xóa hẳn,
    // điều này giúp số lượng 'Nhân viên TV' tổng thể không bị giảm đi sai lệch.
    setProbation((prev: any[]) =>
      prev.map((p) => (p.id === id ? { ...p, status: "pending_evaluation" } : p))
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Link to="/manager/dashboard">
        <Button variant="secondary" className="mb-4">
          Quay lại Dashboard
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">Đánh giá Thử Việc</h1>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
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
            {ongoingProbations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Không có nhân viên nào cần đánh giá.
                </TableCell>
              </TableRow>
            ) : (
              ongoingProbations.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.dueDate}</TableCell>

                  <TableCell className="text-right">
                    <ReviewDialog row={row} onReviewed={() => handleReviewed(row.id)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Reviews;
