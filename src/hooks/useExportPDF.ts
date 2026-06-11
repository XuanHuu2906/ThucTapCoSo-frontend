import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';

export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async (DocumentComponent: React.ReactElement<any>, fileName: string) => {
    setIsExporting(true);
    try {
      const blob = await pdf(DocumentComponent).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPDF, isExporting };
};
