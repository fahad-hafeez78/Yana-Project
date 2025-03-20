import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { jsPDF } from 'jspdf';
import { showErrorAlert } from '../../../redux/actions/alertActions';
import customersMiddleware from '../../../redux/middleware/customersMiddleware';

const ExportOrders = ({ allOrders, VendorDishStats, setisExportOrders }) => {
  const dispatch = useDispatch();
  const [customerData, setcustomerData] = useState(null);

  // Function to get the logo base64 image
  const getLogoBase64 = async () => {
    const response = await fetch('/Yana Logo.png');
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Function to generate the PDF
  const generatePDF = async (data, isVendorData) => {
    if (data.length === 0) {
      dispatch(showErrorAlert("No data available for download."));
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
      const currentDate = new Date();
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }).format(currentDate);
      doc.text(formattedDate, pageWidth / 2, currentYPosition + logoHeight + 12.5, { align: 'center' });

      currentYPosition += logoHeight + boxHeight + 15;

      // Conditional labels based on whether it's Vendor data or Order data
      const isOrder = !isVendorData;
      const idLabel = isOrder ? 'Order ID:' : 'Vendor ID:';
      const totalLabel = isOrder ? 'Meal Plan:' : 'Total Orders:';
      const nameLabel = isOrder ? 'Customer Name:' : 'Vendor Name:';

      // Add order details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(idLabel, padding, currentYPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(isOrder ? item?._id || 'N/A' : item?.VendorID || 'N/A', padding + 40, currentYPosition);

      doc.setFont('helvetica', 'normal');
      doc.text(totalLabel, pageWidth - padding - 50, currentYPosition);
      doc.setFont('helvetica', 'bold');
      doc.text((isOrder ? item?.mealPlan : item?.TotalOrders)?.toString() || 'N/A', pageWidth - padding - 10, currentYPosition);

      // Add spacing
      currentYPosition += 10;

      // Customer/Vendor details
      const customerDetails = [
        `${nameLabel} ${item?.CustomerName || item?.VendorName || 'N/A'}`,
        `${isOrder ? 'Delivery Phone' : 'Phone'}: ${item?.Phone || item?.VendorPhone || 'N/A'}`,
      ];

      // Check if the CustomerID matches and add Phone 2 if available
      if (isOrder && item?.CustomerID) {
        const cust = customerData?.find((customer) => customer._id === item.CustomerID);
        customerDetails.push(`Participant Phone: ${cust?.Phone || 'N/A'}`);
      }

      customerDetails.forEach((detail) => {
        const [label, value] = detail.split(':');
        doc.setFont('helvetica', 'normal');
        doc.text(`${label}:`, padding, currentYPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(value, padding + 39, currentYPosition);

        // Add spacing
        currentYPosition += 10;
      });

      // Address (same for both)
      doc.setFont('helvetica', 'normal');
      doc.text('Address:', padding, currentYPosition + 5);
      currentYPosition += 10;

      const formatAddress = (address) => {
        if (!address) return ['N/A'];
        const { street1, street2, city, state, country, zipcode } = address;
        const lines = [];
        if (street1) lines.push(street1);
        if (street2) lines.push(street2);
        const locationLine = [city, state, zipcode, country].filter(Boolean).join(', ');
        if (locationLine) lines.push(locationLine);
        return lines;
      };

      const addressLines = formatAddress(item?.DeliveryAddress || item?.VendorAddress);
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

      // Add header cells with borders
      headers.forEach((header, index) => {
        const textWidth = doc.getTextWidth(header);
        const cellCenterX = xPosition + colWidths[index] / 2;

        doc.setLineWidth(0.5);

        // Conditional logic for first and second header cells
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
      const dishes = isOrder ? item.DishIDsList : item.Dishes; // VendorDishStats will have Dishes array
      let rowY = tableStartY + 10;

      let totalQty = 0; // Initialize the total quantity variable

      dishes.forEach((dish) => {
        xPosition = padding;

        // Dish Name (left-aligned)
        doc.setFont('helvetica', 'normal');
        doc.text(dish.DishName || dish.MealName, xPosition + 2, rowY + 6); // Left-aligned text

        doc.setLineWidth(0.5);
        doc.setFont('helvetica', 'bold');
        doc.rect(xPosition + 1, rowY, colWidths[0] - 1, 9); // Inner border

        xPosition += colWidths[0];

        // Quantity (center-aligned)
        const qtyTextWidth = doc.getTextWidth(dish.Count.toString());
        const qtyCellCenterX = xPosition + colWidths[1] / 2;
        doc.text(dish.Count.toString(), qtyCellCenterX - qtyTextWidth / 2, rowY + 6);

        doc.setLineWidth(0.5);
        doc.rect(xPosition + 1, rowY, colWidths[1] - 2, 9); // Inner border

        // Add the dish count to the total quantity
        totalQty += dish.Count;

        rowY += 10;
      });

      // Add the Total Qty row at the end of the table
      xPosition = padding;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Qty', xPosition + 2, rowY + 6); // Left-aligned text for "Total Qty"
      doc.setLineWidth(0.5);
      doc.setFont('helvetica', 'bold');
      doc.rect(xPosition + 1, rowY, colWidths[0] - 1, 9); // Inner border
      xPosition += colWidths[0];

      // Display the total quantity of meals
      const totalQtyTextWidth = doc.getTextWidth(totalQty.toString());
      const qtyCellCenterX = xPosition + colWidths[1] / 2;
      doc.text(totalQty.toString(), qtyCellCenterX - totalQtyTextWidth / 2, rowY + 6);
      doc.setLineWidth(0.5);
      doc.rect(xPosition + 1, rowY, colWidths[1] - 2, 9); // Inner border

      currentYPosition = rowY + 10;

      // Add a surrounding border around the entire table
      const tableHeight = rowY - tableStartY + 10;
      doc.setLineWidth(0.5);
      doc.rect(padding, tableStartY, usableWidth, tableHeight); // Outer border for the table

      // Add a page break for the next order if needed
      if (index < data.length - 1) {
        doc.addPage();
      }
    });

    // Save the PDF
    doc.save(isVendorData ? 'VendorDetails.pdf' : 'OrdersDetail.pdf');
  };


  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await dispatch(customersMiddleware.GetAllCustomers());
        if (response.success) {
          setcustomerData(response.data); // Set customer data here
        } else {
          console.error("Error fetching customer data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    // Fetch customer data first
    fetchCustomerData();
  }, [dispatch]);

  useEffect(() => {
    // Only generate PDF after customerData is available
    if (customerData) {
      // Generate PDF for active orders after customer data is loaded
      generatePDF(allOrders, false); // First PDF for active orders

      // Generate a separate PDF for each vendor in the VendorDishStats
      VendorDishStats.forEach(vendor => {
        generatePDF([vendor], true); // Generate PDF for each vendor
      });

      setisExportOrders(false); // Mark export complete
    }
  }, [customerData, allOrders, VendorDishStats, setisExportOrders]);

  return null;
};

export default ExportOrders;
