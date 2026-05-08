import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { offerResponseService } from "@/services/offer-response.service";
import type { OfferInfo } from "@/services/offer-response.service";

type PageState =
  | "loading"
  | "confirm-accept"
  | "decline-form"
  | "success-accepted"
  | "success-declined"
  | "error"
  | "already-responded";

export default function OfferResponse() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const action = searchParams.get("action"); // "accept" or "decline"

  const [pageState, setPageState] = useState<PageState>("loading");
  const [offerInfo, setOfferInfo] = useState<OfferInfo | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Link không hợp lệ.");
      setPageState("error");
      return;
    }

    offerResponseService
      .getOfferInfo(token)
      .then((info) => {
        setOfferInfo(info);
        if (action === "decline") {
          setPageState("decline-form");
        } else {
          setPageState("confirm-accept");
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

  const handleAccept = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      await offerResponseService.acceptOffer(token);
      setPageState("success-accepted");
    } catch {
      setErrorMessage("Không thể xử lý yêu cầu. Vui lòng thử lại.");
      setPageState("error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token || !declineReason.trim()) return;
    setProcessing(true);
    try {
      await offerResponseService.declineOffer(token, declineReason);
      setPageState("success-declined");
    } catch {
      setErrorMessage("Không thể xử lý yêu cầu. Vui lòng thử lại.");
      setPageState("error");
    } finally {
      setProcessing(false);
    }
  };

  // ----- Render helpers -----

  const formatSalary = (value: number) =>
    Number(value).toLocaleString("vi-VN") + " VNĐ";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Offer info card (reused across states)
  const OfferCard = () =>
    offerInfo ? (
      <div style={styles.offerCard}>
        <div style={styles.offerRow}>
          <span style={styles.offerLabel}>Vị trí</span>
          <span style={styles.offerValue}>{offerInfo.jobTitle}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.offerRow}>
          <span style={styles.offerLabel}>Mức lương cơ bản</span>
          <span style={styles.offerValue}>{formatSalary(offerInfo.baseSalary)}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.offerRow}>
          <span style={styles.offerLabel}>Ngày bắt đầu dự kiến</span>
          <span style={styles.offerValue}>{formatDate(offerInfo.startDate)}</span>
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
            <p style={styles.loadingText}>Đang tải thông tin Offer...</p>
          </div>
        )}

        {/* Confirm Accept */}
        {pageState === "confirm-accept" && (
          <>
            <div style={styles.iconCircleGreen}>
              <span style={{ fontSize: 40 }}>✅</span>
            </div>
            <h1 style={styles.title}>Chấp nhận Offer</h1>
            <p style={styles.greeting}>
              Xin chào <strong>{offerInfo?.candidateName}</strong>,
            </p>
            <p style={styles.description}>
              Bạn có chắc chắn muốn chấp nhận lời mời làm việc với thông tin
              bên dưới?
            </p>
            <OfferCard />
            <div style={styles.buttonGroup}>
              <button
                onClick={handleAccept}
                disabled={processing}
                style={{
                  ...styles.btnPrimary,
                  opacity: processing ? 0.6 : 1,
                }}
              >
                {processing ? "Đang xử lý..." : "Xác nhận chấp nhận"}
              </button>
              <button
                onClick={() => setPageState("decline-form")}
                disabled={processing}
                style={styles.btnOutlineDanger}
              >
                Tôi muốn từ chối
              </button>
            </div>
          </>
        )}

        {/* Decline Form */}
        {pageState === "decline-form" && (
          <>
            <div style={styles.iconCircleRed}>
              <span style={{ fontSize: 40 }}>📝</span>
            </div>
            <h1 style={styles.title}>Từ chối Offer</h1>
            <p style={styles.greeting}>
              Xin chào <strong>{offerInfo?.candidateName}</strong>,
            </p>
            <p style={styles.description}>
              Chúng tôi rất tiếc khi biết bạn muốn từ chối. Vui lòng cho chúng
              tôi biết lý do để chúng tôi cải thiện trong tương lai.
            </p>
            <OfferCard />
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Lý do từ chối <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Ví dụ: Đã nhận được offer từ công ty khác, mức lương chưa phù hợp..."
                rows={4}
                style={styles.textarea}
              />
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={handleDecline}
                disabled={processing || !declineReason.trim()}
                style={{
                  ...styles.btnDanger,
                  opacity: processing || !declineReason.trim() ? 0.5 : 1,
                }}
              >
                {processing ? "Đang gửi..." : "Gửi phản hồi từ chối"}
              </button>
              <button
                onClick={() => setPageState("confirm-accept")}
                disabled={processing}
                style={styles.btnOutlineGreen}
              >
                ← Quay lại chấp nhận
              </button>
            </div>
          </>
        )}

        {/* Success - Accepted */}
        {pageState === "success-accepted" && (
          <div style={styles.centerContent}>
            <div style={styles.iconCircleGreen}>
              <span style={{ fontSize: 48 }}>🎉</span>
            </div>
            <h1 style={{ ...styles.title, color: "#059669" }}>
              Chúc mừng bạn!
            </h1>
            <p style={styles.description}>
              Bạn đã chấp nhận Offer thành công. Chúng tôi sẽ gửi thông tin tài
              khoản đăng nhập hệ thống qua email{" "}
              <strong>trong ít phút tới</strong>.
            </p>
            <div style={styles.successCard}>
              <p style={{ margin: 0, color: "#065f46", fontWeight: 600 }}>
                📧 Vui lòng kiểm tra hộp thư email của bạn
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#047857",
                  fontSize: 14,
                }}
              >
                Bạn sẽ nhận được email chứa tên đăng nhập và mật khẩu tạm thời
                để truy cập hệ thống nhân sự.
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
              Cảm ơn bạn đã dành thời gian phản hồi. Chúng tôi đã ghi nhận lý
              do từ chối của bạn và sẽ liên hệ nếu có cơ hội phù hợp trong
              tương lai.
            </p>
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 24 }}>
              Chúc bạn nhiều thành công trên con đường sự nghiệp! 🌟
            </p>
          </div>
        )}

        {/* Already Responded */}
        {pageState === "already-responded" && (
          <div style={styles.centerContent}>
            <div style={styles.iconCircleYellow}>
              <span style={{ fontSize: 48 }}>⚠️</span>
            </div>
            <h1 style={styles.title}>Offer đã được phản hồi</h1>
            <p style={styles.description}>
              Offer này đã được phản hồi trước đó. Mỗi Offer chỉ có thể phản
              hồi một lần.
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

// ---- Inline styles ----
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
  offerCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
    textAlign: "left" as const,
  },
  offerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
  },
  offerLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  offerValue: {
    color: "#1f2937",
    fontWeight: 600,
    fontSize: 14,
  },
  divider: {
    height: 1,
    background: "#e5e7eb",
  },
  formGroup: {
    textAlign: "left" as const,
    marginBottom: 24,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    lineHeight: 1.5,
    resize: "vertical" as const,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
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
    transition: "transform 0.15s, box-shadow 0.15s",
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
