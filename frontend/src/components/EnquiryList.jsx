import '../styles/table.css';

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth";
import * as api from "../api/api";

export default function EnquiryList() {
  const { role } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    if (role === "ADMIN") {
      api.getEnquiries().then(setList).catch(() => {});
    }
  }, [role]);

  if (role !== "ADMIN") return null;

  return (
    <div className="card" style={{ maxWidth: 1000, margin: "18px auto" }}>
      <h2>All Enquiries</h2>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Name</th>
            <th style={{ width: 220 }}>Email</th>
            <th style={{ width: 140 }}>Phone</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.name}</td>
              <td>{e.email}</td>
              <td>{e.phone}</td>
              <td>{e.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
