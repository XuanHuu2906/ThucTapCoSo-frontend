import { Star, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { useManager } from "@/context/ManagerContext";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { interviewService } from "@/services";
import toast from "react-hot-toast";

const EvaluateDialog = ({ row, onEvaluated }: { row: any, onEvaluated: (status: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [techScore, setTechScore] = useState(8);
  const [softScore, setSoftScore] = useState(7);
  const [attitudeScore, setAttitudeScore] = useState(9);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (result: "passed" | "failed") => {
    setIsLoading(true);
    try {
      await interviewService.submitResult(String(row.id), {
        technicalScore: techScore,
        softSkillScore: softScore,
        attitudeScore: attitudeScore,
        comment: "",
        result,
      });
      toast.success("Đánh giá thành công!");
      setOpen(false);
      onEvaluated(result === "passed" ? "Hoàn thành" : "Không đạt");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi chấm điểm.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">Chấm điểm</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đánh giá ứng viên</DialogTitle>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-md mt-2">
          <p className="font-semibold text-lg">{row.name}</p>
          <p className="text-sm text-muted-foreground">Ứng tuyển: {row.role}</p>
        </div>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">Kỹ năng chuyên môn</span>
              </div>
              <span className="text-sm font-bold">{techScore}/10</span>
            </div>
            <Slider value={[techScore]} onValueChange={(v) => setTechScore(v[0])} max={10} step={1} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">Kỹ năng mềm</span>
              </div>
              <span className="text-sm font-bold">{softScore}/10</span>
            </div>
            <Slider value={[softScore]} onValueChange={(v) => setSoftScore(v[0])} max={10} step={1} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">Thái độ văn hoá</span>
              </div>
              <span className="text-sm font-bold">{attitudeScore}/10</span>
            </div>
            <Slider value={[attitudeScore]} onValueChange={(v) => setAttitudeScore(v[0])} max={10} step={1} />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-3">Kết Quả</p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="h-16 text-lg border-2 border-green-500 bg-green-500 text-green-700 hover:bg-green-100 hover:text-green-800 disabled:opacity-50"
              variant="primary"
              onClick={() => handleSubmit("passed")}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Đạt
            </Button>
            <Button
              className="h-16 text-lg border-2 border-red-500 bg-red-500 text-red-700 hover:bg-red-100 hover:text-red-800 disabled:opacity-50"
              variant="primary"
              onClick={() => handleSubmit("failed")}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Không đạt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Interviews = () => {
  const { interviews, setInterviews } = useManager();

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

  const upcomingInterviews = interviews.filter((row) => row.status === "Chờ xác nhận");
  const scoredInterviews = interviews.filter(
    (row) => row.status === "Hoàn thành" || row.status === "Không đạt"
  );

  const renderTable = (data: typeof interviews, showAction = true) => (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ứng viên</TableHead>
            <TableHead>Vị trí</TableHead>
            <TableHead>Ngày PV</TableHead>
            <TableHead>Trạng thái</TableHead>
            {showAction && <TableHead>Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showAction ? 5 : 4} className="text-center py-8 text-muted-foreground">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
                {showAction && (
                  <TableCell className="text-right">
                    {row.status === "Chờ xác nhận" ? (
                      <EvaluateDialog
                        row={row}
                        onEvaluated={(newStatus) => {
                          setInterviews((prev) =>
                            prev.map((item) => (item.id === row.id ? { ...item, status: newStatus } : item))
                          );
                        }}
                      />
                    ) : (
                      <Button variant="outline" disabled>
                        Đã đánh giá
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lịch Phỏng Vấn</h1>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
          <TabsTrigger value="scored">Đã chấm</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {renderTable(upcomingInterviews, true)}
        </TabsContent>
        <TabsContent value="scored">
          {renderTable(scoredInterviews, false)}
        </TabsContent>
        <TabsContent value="all">
          {renderTable(interviews, true)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Interviews;
