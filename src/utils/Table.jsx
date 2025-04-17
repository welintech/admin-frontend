import React, { useEffect } from "react";
import styled from "styled-components";
import { FlexContainerRow, StyledInput } from "./StyledComponents";

const StyledTableContainer = styled.div`
  max-width: 90%;
  margin: 0.5rem auto;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  // font-size: 1rem;

  /* Add max-height and overflow for scrolling */
  max-height: 70vh; /* Adjust as needed */
  overflow: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    scroll: auto;

    th,
    td {
      text-align: left;
      padding: 0.8rem;
      border: 1px solid #dee2e6;
    }

    th {
      // background-color: #007bff;
      background-color: #87e064;
      color: #fff;
      font-weight: 600;
    }

    tbody tr:nth-child(odd) {
      background-color: #f1f3f5;
    }

    tbody tr:hover {
      background-color: #e9ecef;
    }
  }
`;
const GST_RATE = 5;

const Table = ({ columns, data }) => {
  const [percentage, setPercentage] = React.useState(100);
  const [finalData, setFinalData] = React.useState([]);

  useEffect(() => {
    setPercentage(100);
  }, [data]);

  useEffect(() => {
    const temp = data.map((item) => {
      const premium = Math.round(item.insurancePremium);
      const profit = Math.round(premium * (percentage / 100));
      const totalPremium = premium + profit;
      const gst = Math.round((totalPremium * GST_RATE) / 100);
      const finalPrice = totalPremium + gst;

      return [
        item.coverage,
        item.insurancePremium,
        totalPremium,
        gst,
        finalPrice,
      ];
    });

    setFinalData(temp);
  }, [data, percentage]);

  const handlePercentageChange = (e) => {
    setPercentage(e.target.value);
  };

  if (!data || data.length === 0) return null; // Early return if no data

  return (
    <StyledTableContainer>
      <FlexContainerRow>
        <h3>Profit percentage</h3>
        <StyledInput
          type="number"
          value={percentage}
          onChange={handlePercentageChange}
        />
      </FlexContainerRow>
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {finalData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </StyledTableContainer>
  );
};

export default Table;
