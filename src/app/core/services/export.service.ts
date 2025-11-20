import { Injectable } from '@angular/core';

export type ExportFormat = 'png' | 'pdf' | 'csv';

export interface ExportOptions {
  filename: string;
  format: ExportFormat;
  element?: HTMLElement;
  data?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /**
   * Export a DOM element as an image
   */
  async exportAsImage(element: HTMLElement, filename: string): Promise<void> {
    try {
      // Use html2canvas to capture the element
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          this.downloadBlob(blob, `${filename}.png`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting as image:', error);
      throw new Error('Failed to export as image');
    }
  }

  /**
   * Export a DOM element as PDF
   */
  async exportAsPDF(element: HTMLElement, filename: string): Promise<void> {
    try {
      // Use html2canvas and jsPDF to create PDF
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 width in mm (landscape)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      throw new Error('Failed to export as PDF');
    }
  }

  /**
   * Export data as CSV
   */
  exportAsCSV(data: any[], filename: string, headers?: string[]): void {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Get headers from first object if not provided
      const csvHeaders = headers || Object.keys(data[0]);

      // Create CSV content
      let csvContent = csvHeaders.join(',') + '\n';

      data.forEach((row) => {
        const values = csvHeaders.map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        });
        csvContent += values.join(',') + '\n';
      });

      // Create and download blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, `${filename}.csv`);
    } catch (error) {
      console.error('Error exporting as CSV:', error);
      throw new Error('Failed to export as CSV');
    }
  }

  /**
   * Export multiple reports as a single PDF
   */
  async exportMultipleAsPDF(elements: HTMLElement[], filename: string): Promise<void> {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 width in mm (landscape)

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting multiple reports as PDF:', error);
      throw new Error('Failed to export reports as PDF');
    }
  }

  /**
   * Download a blob as a file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Show export options dialog
   */
  async showExportDialog(element: HTMLElement, reportName: string): Promise<void> {
    // For now, just export as PNG
    // In a real implementation, this would show a dialog to choose format
    await this.exportAsImage(element, reportName);
  }
}
