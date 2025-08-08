import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { jsPDF } from 'jspdf';
import { showErrorAlert } from '../../../redux/actions/alertActions';

const ExportOrders = ({ allOrders, VendorDishStats, setIsExportOrders, setVendorDishStats, setOrdersToExport }) => {
  const dispatch = useDispatch();

  const getLogoBase64 = async () => {
    const response = await fetch('/YanaLogo.png');
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getNextThursday = () => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7; // 4 represents Thursday
    const nextThursday = new Date(currentDate);
    nextThursday.setDate(currentDate.getDate() + daysUntilThursday);
    return nextThursday;
  };


  // Function to generate OrdersDetail PDF
  const generateOrdersPDF = async (data) => {
    if (data.length === 0) {
      dispatch(showErrorAlert("No order data available for the selected vendor"));
      return;
    }

    const doc = new jsPDF();
    const padding = 5;
    const pageWidth = doc.internal.pageSize.width;
    const usableWidth = pageWidth - padding * 2;
    const logoBase64 = await getLogoBase64();
    const logoHeight = 18;
    const logoWidth = 36;

    data.forEach((item, index) => {
      let currentYPosition = padding;
      // Add logo
      doc.addImage(logoBase64, 'PNG', padding, currentYPosition, logoWidth, logoHeight);

      // Add black header with formatted date
      const boxHeight = 12;
      doc.setFillColor(0, 0, 0);
      doc.rect(padding, currentYPosition + logoHeight + 5, usableWidth, boxHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const nextThursday = getNextThursday();
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }).format(nextThursday);
      doc.text(formattedDate, pageWidth / 2, currentYPosition + logoHeight + 12.5, { align: 'center' });

      currentYPosition += logoHeight + boxHeight + 15;

      // Order details
      const idLabel = 'Order ID:';
      const totalLabel = 'Meal Plan:';
      const nameLabel = 'Customer Name:';

      let totalQty = 0;
      item?.meals?.forEach((dish) => {
        totalQty += dish.quantity;
      });
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(idLabel, padding, currentYPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(item?.order_id || 'N/A', padding + 40, currentYPosition);

      doc.setFont('helvetica', 'normal');
      doc.text(totalLabel, pageWidth - padding - 50, currentYPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(totalQty.toString() || 'N/A', pageWidth - padding - 10, currentYPosition);

      // Add spacing
      currentYPosition += 10;

      // Customer details
      const customerDetails = [
        `${nameLabel} ${item?.customer?.name || 'N/A'}`,
        `Phone: ${item?.phone || 'N/A'}`,
      ];

      customerDetails.forEach((detail) => {
        const [label, value] = detail.split(':');
        doc.setFont('helvetica', 'normal');
        doc.text(`${label}:`, padding, currentYPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(value, padding + 39, currentYPosition);
        currentYPosition += 10;
      });

      // Address
      doc.setFont('helvetica', 'normal');
      doc.text('Address:', padding, currentYPosition);
      currentYPosition += 10;

      const formatAddress = (address) => {
        if (!address) return ['N/A'];
        const { street1, street2, city, state, zip } = address;
        const lines = [];
        if (street1) lines.push(street1);
        if (street2) lines.push(street2);
        const locationLine = [city, state, zip].filter(Boolean).join(', ');
        if (locationLine) lines.push(locationLine);
        return lines;
      };
      const addressLines = formatAddress(item?.delivery_location);
      addressLines.forEach((line) => {
        doc.setFont('helvetica', 'bold');
        doc.text(line, padding + 40, currentYPosition - 10);
        currentYPosition += 5;
      });

      // Table header
      const tableStartY = currentYPosition - 10;
      const colWidths = [usableWidth * 0.8, usableWidth * 0.2];
      const headers = ['Meal Name(s)', 'Qty'];

      doc.setFont('helvetica', 'bold');
      let xPosition = padding;

      headers.forEach((header, index) => {
        const textWidth = doc.getTextWidth(header);
        const cellCenterX = xPosition + colWidths[index] / 2;
        doc.setLineWidth(0.5);
        if (index === 0) {
          // For the first header cell, use colWidths[index] - 1.5
          doc.rect(xPosition + 1, tableStartY + 1, colWidths[index] - 1, 8); // Inner border
        } else {
          // For the second header cell, use colWidths[index] - 2
          doc.rect(xPosition + 1, tableStartY + 1, colWidths[index] - 2, 8); // Inner border
        }

        doc.text(header, cellCenterX - textWidth / 2, tableStartY + 6);
        xPosition += colWidths[index];
      });

      // Table rows
      const dishes = item.meals;
      let rowY = tableStartY + 10;
      // let totalQty = 0;

      dishes.forEach((dish) => {
        xPosition = padding;
        doc.setFont('helvetica', 'normal');
        doc.text(dish?.meal?.name || 'N/A', xPosition + 2, rowY + 6);
        doc.setLineWidth(0.5);
        doc.setFont('helvetica', 'bold');
        doc.rect(xPosition + 1, rowY, colWidths[0] - 1, 9);
        xPosition += colWidths[0];

        const qtyTextWidth = doc.getTextWidth(dish.quantity.toString());
        const qtyCellCenterX = xPosition + colWidths[1] / 2;
        doc.text(dish.quantity.toString(), qtyCellCenterX - qtyTextWidth / 2, rowY + 6);
        doc.setLineWidth(0.5);
        doc.rect(xPosition + 1, rowY, colWidths[1] - 2, 9);

        // totalQty += dish.Count;
        rowY += 10;
      });

      // Total Qty row
      xPosition = padding;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Qty', xPosition + 2, rowY + 6);
      doc.setLineWidth(0.5);
      doc.rect(xPosition + 1, rowY, colWidths[0] - 1, 9);
      xPosition += colWidths[0];

      const totalQtyTextWidth = doc.getTextWidth(totalQty.toString());
      const qtyCellCenterX = xPosition + colWidths[1] / 2;
      doc.text(totalQty.toString(), qtyCellCenterX - totalQtyTextWidth / 2, rowY + 6);
      doc.setLineWidth(0.5);
      doc.rect(xPosition + 1, rowY, colWidths[1] - 2, 9);

      currentYPosition = rowY + 10;

      // Add a surrounding border around the entire table
      const tableHeight = rowY - tableStartY + 10;
      doc.setLineWidth(0.5);
      doc.rect(padding, tableStartY, usableWidth, tableHeight);

      // Add page break if needed
      if (index < data.length - 1) {
        doc.addPage();
      }
    });

    doc.save('OrdersDetail.pdf');
  };

  // Function to generate VendorDetails PDF
  const generateVendorPDF = async (data) => {
    console.log("data data vendor", data)

    if (data.length === 0) {
      dispatch(showErrorAlert("No order data available for the selected vendor"));
      return;
    }

    const doc = new jsPDF();
    const padding = 5;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const usableWidth = pageWidth - padding * 2;
    const logoBase64 = await getLogoBase64();
    const logoHeight = 18;
    const logoWidth = 36;
    const marginTop = 10;
    const pageLimitY = pageHeight - marginTop;

    let currentYPosition = padding;

    // Add logo
    doc.addImage(logoBase64, 'PNG', padding, currentYPosition, logoWidth, logoHeight);
    currentYPosition = logoHeight + padding;

    // Add header
    const boxHeight = 12;
    doc.setFillColor(0, 0, 0);
    doc.rect(padding, currentYPosition + 5, usableWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const nextThursday = getNextThursday();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(nextThursday);
    doc.text(formattedDate, pageWidth / 2, currentYPosition + logoHeight - 5.5, { align: 'center' });
    currentYPosition += boxHeight + 15;

    // Vendor Details
    const idLabel = 'Vendor ID:';
    const totalLabel = 'Total Orders:';
    const nameLabel = 'Vendor Name:';

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(idLabel, padding, currentYPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data?.vendor_details?.vendor_id || 'N/A', padding + 40, currentYPosition);

    doc.setFont('helvetica', 'normal');
    doc.text(totalLabel, pageWidth - padding - 50, currentYPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data?.total_orders?.toString() || 'N/A', pageWidth - padding - 10, currentYPosition);

    currentYPosition += 10;

    const vendorDetails = [
      `${nameLabel} ${data?.vendor_details?.name || 'N/A'}`,
      `Phone: ${data?.vendor_details?.phone || 'N/A'}`,
    ];

    vendorDetails.forEach((detail) => {
      const [label, value] = detail.split(':');
      doc.setFont('helvetica', 'normal');
      doc.text(`${label}:`, padding, currentYPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(value, padding + 39, currentYPosition);
      currentYPosition += 10;
    });

    // Address section
    doc.setFont('helvetica', 'normal');
    doc.text('Address:', padding, currentYPosition + 5);
    currentYPosition += 10;

    const formatAddress = (address) => {
      if (!address) return ['N/A'];
      const { street1, street2, city, state, country, zipx } = address;
      const lines = [];
      if (street1) lines.push(street1);
      if (street2) lines.push(street2);
      const locationLine = [city, state, zipx, country].filter(Boolean).join(', ');
      if (locationLine) lines.push(locationLine);
      return lines;
    };

    const addressLines = formatAddress(data?.vendor_details?.address);
    addressLines.forEach((line) => {
      doc.setFont('helvetica', 'bold');
      doc.text(line, padding + 40, currentYPosition - 10);
      currentYPosition += 5;
    });

    // Table setup
    const tableStartY = currentYPosition;
    const colWidths = [usableWidth * 0.8, usableWidth * 0.2];
    const headers = ['Meal Name(s)', 'Qty'];

    doc.setFont('helvetica', 'bold');
    let xPosition = padding;

    // Table header
    headers.forEach((header, index) => {
      const textWidth = doc.getTextWidth(header);
      const cellCenterX = xPosition + colWidths[index] / 2;
      doc.setLineWidth(0.5);

      if (index === 0) {
        // For the first header cell, use colWidths[index] - 1.5
        doc.rect(xPosition + 1, tableStartY + 1, colWidths[index] - 1, 8); // Inner border
      } else {
        // For the second header cell, use colWidths[index] - 2
        doc.rect(xPosition + 1, tableStartY + 1, colWidths[index] - 2, 8); // Inner border
      }
      doc.text(header, cellCenterX - textWidth / 2, tableStartY + 6);
      xPosition += colWidths[index];
    });

    // Table rows
    let rowY = tableStartY + 10;
    let totalQty = 0;
    let rowsOnCurrentPage = 0;

    // Draw rows, page break handling
    data?.meal_details?.forEach((dish) => {
      if (rowY > pageLimitY) {
        doc.addPage();
        rowY = padding;

        // Draw the border around the entire table
        doc.setLineWidth(0.5);
        doc.rect(padding, tableStartY, usableWidth, rowY - tableStartY);
      }

      xPosition = padding;
      doc.setFont('helvetica', 'normal');
      doc.text(dish.meal_name || 'N/A', xPosition + 2, rowY + 6);
      doc.setLineWidth(0.5);
      doc.setFont('helvetica', 'bold');
      doc.rect(xPosition + 1, rowY, colWidths[0] - 1, 9);
      xPosition += colWidths[0];

      const qtyTextWidth = doc.getTextWidth(dish.total_quantity.toString());
      const qtyCellCenterX = xPosition + colWidths[1] / 2;
      doc.text(dish.total_quantity.toString(), qtyCellCenterX - qtyTextWidth / 2, rowY + 6);
      doc.setLineWidth(0.5);
      doc.rect(xPosition + 1, rowY, colWidths[1] - 2, 9);

      totalQty += dish.total_quantity;
      rowY += 10;
      rowsOnCurrentPage++;

      // Draw border after all rows of this page if it overflows.
      if (rowsOnCurrentPage === data.meal_details.length || rowY > pageLimitY) {
        doc.setLineWidth(0.5);
        doc.rect(padding, tableStartY, usableWidth, rowY - tableStartY + 10);  // Draw table border again
      }
    });

    // Total quantity row
    xPosition = padding;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Qty', xPosition + 2, rowY + 6);
    doc.setLineWidth(0.5);
    doc.rect(xPosition + 1, rowY, colWidths[0] - 1, 9);
    xPosition += colWidths[0];

    const totalQtyTextWidth = doc.getTextWidth(totalQty.toString());
    const qtyCellCenterX = xPosition + colWidths[1] / 2;
    doc.text(totalQty.toString(), qtyCellCenterX - totalQtyTextWidth / 2, rowY + 6);
    doc.setLineWidth(0.5);
    doc.rect(xPosition + 1, rowY, colWidths[1] - 2, 9);

    currentYPosition = rowY + 10;

    // Save PDF
    doc.save('VendorDetails.pdf');
  };

  useEffect(() => {
    if (allOrders) generateOrdersPDF(allOrders);
    if (VendorDishStats) generateVendorPDF(VendorDishStats);
    setIsExportOrders(false);
    setOrdersToExport([])
    setVendorDishStats([]);
  }, []);

  return null;
};

export default ExportOrders;
