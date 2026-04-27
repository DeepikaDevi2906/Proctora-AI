import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5000");

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [current, setCurrent] = useState("Monitoring...");

  useEffect(() => {
    socket.on("warning", (data) => {
      setCurrent(data.message);

      setLogs((prev) => [
        {
          message: data.message,
          level: data.level,
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    });

    return () => socket.off("warning");
  }, []);

  const getColor = (level) => {
    if (level === "high") return "#ef4444";
    if (level === "medium") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={styles.container}>
      <h2>📊 Proctora AI Dashboard</h2>

      <div style={styles.current}>
        Current Status: {current}
      </div>

      <h3>Event Log</h3>

      <div style={styles.logBox}>
        {logs.map((log, index) => (
          <div key={index} style={{
            ...styles.logItem,
            background: getColor(log.level)
          }}>
            {log.time} - {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    background: "#0f172a",
    color: "white",
    minHeight: "100vh"
  },
  current: {
    margin: "20px 0",
    fontSize: "18px",
    fontWeight: "bold"
  },
  logBox: {
    marginTop: "10px"
  },
  logItem: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "6px"
  }
};

export default AdminDashboard;