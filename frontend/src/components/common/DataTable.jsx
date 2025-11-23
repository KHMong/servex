import React from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import './DataTable.css';

const DataTable = ({ columns, data, loading, error, emptyMessage = "No records found." }) => {
  if (loading) {
    return <div className="text-center p-5"><Spinner /></div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center p-5 text-muted">{emptyMessage}</div>;
  }

  return (
    <>
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      <div className="table-responsive shadow-sm border rounded bg-white">
        <Table hover className="mb-0 align-middle custom-table">
          <thead className="bg-light">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="py-3 text-muted fw-bold border-bottom-0" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-3 border-bottom">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default DataTable;