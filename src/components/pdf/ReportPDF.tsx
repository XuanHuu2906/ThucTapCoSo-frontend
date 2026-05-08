import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Đăng ký font Roboto để hiển thị Tiếng Việt
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#334155',
    marginBottom: 10,
    marginTop: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cardTitle: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    marginTop: 5,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f1f5f9',
    padding: 8,
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 700,
    color: '#334155',
  },
  tableCell: {
    fontSize: 10,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

export interface ReportData {
  totalApplications: number;
  hiredCount: number;
  hiringRate: string;
  avgTimeToHire: string;
  openJobsCount: number;
  deptData: { name: string; value: number }[];
  timeFilterLabel: string;
  jobFilterLabel: string;
}

export const ReportPDF: React.FC<{ data: ReportData }> = ({ data }) => {
  const currentDate = new Date().toLocaleString('vi-VN');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Báo Cáo Tuyển Dụng</Text>
          <Text style={styles.subtitle}>Thời gian: {data.timeFilterLabel} | Vị trí: {data.jobFilterLabel} | Hệ thống quản lý tuyển dụng (UC-15)</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={{ ...styles.card, marginLeft: 0 }}>
            <Text style={styles.cardTitle}>Tổng ứng viên</Text>
            <Text style={styles.cardValue}>{data.totalApplications}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đã tuyển (Hired)</Text>
            <Text style={styles.cardValue}>{data.hiredCount}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tỷ lệ tuyển</Text>
            <Text style={styles.cardValue}>{data.hiringRate}%</Text>
          </View>
          <View style={{ ...styles.card, marginRight: 0 }}>
            <Text style={styles.cardTitle}>Tin đang mở</Text>
            <Text style={styles.cardValue}>{data.openJobsCount}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Phân bố ứng viên theo vị trí</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Vị trí (Job Title)</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Số lượng hồ sơ</Text>
            </View>
          </View>
          
          {data.deptData.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.value}</Text>
              </View>
            </View>
          ))}
          
          {data.deptData.length === 0 && (
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '100%' }}>
                <Text style={{ ...styles.tableCell, textAlign: 'center' }}>Không có dữ liệu</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Báo cáo được xuất tự động từ Hệ thống vào lúc {currentDate}.
        </Text>
      </Page>
    </Document>
  );
};
