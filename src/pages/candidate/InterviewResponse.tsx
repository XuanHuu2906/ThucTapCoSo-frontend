import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { interviewResponseService } from "@/services/interview-response.service";
import type { InterviewInfo } from "@/services/interview-response.service";

type PageState =
  | "loading"
  | "confirm"
  | "decline-confirm"
  | "success-confirmed"
  | "success-declined"
  | "error"
  | "already-responded";

export default function InterviewResponse() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const action = searchParams.get("action");

  const [pageState, setPageState] = useState<PageState>("loading");
  const [interviewInfo, setInterviewInfo] = useState<InterviewInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Link không hợp lệ.");
      setPageState("error");
      return;
    }

    interviewResponseService
      .getInterviewInfo(token)
      .then((info) => {
        setInterviewInfo(info);
        if (action === "decline") {
          setPageState("decline-confirm");
        } else {
          setPageState("confirm");
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 400) {
          setPageState("already-responded");
        } else if (status === 404) {
          setErrorMessage("Link đã hết hạn hoặc không tồn tại.");
          setPageState("error");
        } else {
          setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
          setPageState("error");
        }
      });
  }, [token, action]);

  const handleConfirm = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      await interviewResponseService.confirmInterview(token);
      setPageState("success-confirmed");
    } catch {
      setErrorMessage("Không thể xử lý yêu cầu. Vui lòng thử lại.");
      setPageState("error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      await interviewResponseService.declineInterview(token);
      setPageState("success-declined");
    } catch {
      setErrorMessage("Không thể xử lý yêu cầu. Vui lòng thử lại.");
      setPageState("error");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "full",
      timeStyle: "short",
    });

  const typeLabel: Record<string, string> = {
    HR: "Phỏng vấn HR",
    Technical: "Phỏng vấn chuyên môn",
    Final: "Phỏng vấn cuối",
  };

  const InterviewCard = () =>
    interviewInfo ? (
      <div style={styles.infoCard}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Vị trí</span>
          <span style={styles.infoValue}>{interviewInfo.jobTitle}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Hình thức</span>
          <span style={styles.infoValue}>{typeLabel[interviewInfo.type] || interviewInfo.type}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Thời gian</span>
          <span style={styles.infoValue}>{formatDate(interviewInfo.interviewDate)}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Địa điểm</span>
          <span style={styles.infoValue}>{interviewInfo.location || "Chưa cập nhật"}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Người phỏng vấn</span>
          <span style={styles.infoValue}>{interviewInfo.interviewerName}</span>
        </div>
      </div>
    ) : null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Loading */}
        {pageState === "loading" && (
          <div style={styles.centerContent}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Đang tải thông tin lịch phỏng vấn...</p>
          </div>
        )}

        {/* Confirm attendance */}
        {pageState === "confirm" && (
          <>
            <div style={styles.iconCircleGreen}>
              <span style={{ fontSize: 40 }}>📅</span>
            </div>
            <h1 style={styles.title}>Xác nhận tham gia phỏng vấn</h1>
            <p style={styles.greeting}>
              Xin chào <strong>{interviewInfo?.candidateName}</strong>,
            </p>
            <p style={styles.description}>
              Bạn có chắc chắn muốn tham gia buổi phỏng vấn với thông tin chi tiết bên dưới?
            </p>
            <InterviewCard />
            <div style={styles.buttonGroup}>
              <button
                onClick={handleConfirm}
                disabled={processing}
                style={{
                  ...styles.btnPrimary,
                  opacity: processing ? 0.6 : 1,
                }}
              >
                {processing ? "Đang xử lý..." : "✅ Xác nhận tham gia"}
              </button>
              <button
                onClick={() => setPageState("decline-confirm")}
                disabled={processing}
                style={styles.btnOutlineDanger}
              >
                ❌ Tôi muốn từ chối
              </button>
            </div>
          </>
        )}

        {/* Decline confirmation */}
        {pageState === "decline-confirm" && (
          <>
            <div style={styles.iconCircleRed}>
              <span style={{ fontSize: 40 }}>❌</span>
            </div>
            <h1 style={styles.title}>Từ chối lịch phỏng vấn</h1>
            <p style={styles.greeting}>
              Xin chào <strong>{interviewInfo?.candidateName}</strong>,
            </p>
            <p style={styles.description}>
              Bạn có chắc chắn muốn từ chối buổi phỏng vấn này? Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận Tuyển dụng.
            </p>
            <InterviewCard />
            <div style={styles.buttonGroup}>
              <button
                onClick={handleDecline}
                disabled={processing}
                style={{
                  ...styles.btnDanger,
                  opacity: processing ? 0.5 : 1,
                }}
              >
                {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
              <button
                onClick={() => setPageState("confirm")}
                disabled={processing}
                style={styles.btnOutlineGreen}
              >
                ← Quay lại đồng ý tham gia
              </button>
            </div>
          </>
        )}

        {/* Success - Confirmed */}
        {pageState === "success-confirmed" && (
          <div style={styles.centerContent}>
            <div style={styles.iconCircleGreen}>
              <span style={{ fontSize: 48 }}>🎉</span>
            </div>
            <h1 style={{ ...styles.title, color: "#059669" }}>Xác nhận thành công!</h1>
            <p style={styles.description}>
              Cảm ơn bạn đã xác nhận tham gia phỏng vấn. Chúng tôi sẽ gửi email nhắc nhở đến bạn trước buổi phỏng vấn.
            </p>
            <div style={styles.successCard}>
              <p style={{ margin: 0, color: "#065f46", fontWeight: 600 }}>
                📅 Thông tin lịch phỏng vấn
              </p>
              <p style={{ margin: "8px 0 0", color: "#047857", fontSize: 14 }}>
                Vui lòng đến đúng giờ và chuẩn bị sẵn sàng cho buổi phỏng vấn.
              </p>
            </div>
          </div>
        )}

        {/* Success - Declined */}
        {pageState === "success-declined" && (
          <div style={styles.centerContent}>
            <div style={styles.iconCircleRed}>
              <span style={{ fontSize: 48 }}>📨</span>
            </div>
            <h1 style={styles.title}>Đã ghi nhận phản hồi</h1>
            <p style={styles.description}>
              Cảm ơn bạn đã phản hồi. Chúng tôi đã ghi nhận việc bạn từ chối lịch phỏng vấn này.
            </p>
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 24 }}>
              Nếu bạn muốn đặt lại lịch phỏng vấn khác, vui lòng liên hệ bộ phận Tuyển dụng.
            </p>
          </div>
        )}

        {/* Already Responded */}
        {pageState === "already-responded" && (
          <div style={styles.centerContent}>
            <div style={styles.iconCircleYellow}>
              <span style={{ fontSize: 48 }}>⚠️</span>
            </div>
            <h1 style={styles.title}>Đã phản hồi trước đó</h1>
            <p style={styles.description}>
              Lịch phỏng vấn này đã được phản hồi trước đó. Mỗi lịch phỏng vấn chỉ có thể phản hồi một lần.
            </p>
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 16 }}>
              Nếu bạn cần hỗ trợ, vui lòng liên hệ bộ phận Tuyển dụng.
            </p>
          </div>
        )}

        {/* Error */}
        {pageState === "error" && (
          <div style={styles.centerContent}>
            <div style={styles.iconCircleRed}>
              <span style={{ fontSize: 48 }}>❌</span>
            </div>
            <h1 style={styles.title}>Có lỗi xảy ra</h1>
            <p style={styles.description}>{errorMessage}</p>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p>Hệ thống Quản lý Tuyển dụng</p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "40px 36px",
    maxWidth: 520,
    width: "100%",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    textAlign: "center" as const,
  },
  centerContent: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  iconCircleGreen: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconCircleRed: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconCircleYellow: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 8,
  },
  greeting: {
    color: "#4b5563",
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  infoCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
    textAlign: "left" as const,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  infoValue: {
    color: "#1f2937",
    fontWeight: 600,
    fontSize: 14,
    textAlign: "right" as const,
    maxWidth: "60%",
  },
  divider: {
    height: 1,
    background: "#e5e7eb",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  btnPrimary: {
    padding: "14px 24px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "14px 24px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnOutlineDanger: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "2px solid #fecaca",
    background: "transparent",
    color: "#ef4444",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnOutlineGreen: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "2px solid #a7f3d0",
    background: "transparent",
    color: "#059669",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  successCard: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: 12,
    padding: "16px 20px",
    marginTop: 20,
    textAlign: "left" as const,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: "1px solid #e5e7eb",
    color: "#9ca3af",
    fontSize: 13,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e5e7eb",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 16,
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 14,
  },
};
