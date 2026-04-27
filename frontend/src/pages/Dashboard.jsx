import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Proctora AI</h1>

      <button style={styles.button} onClick={() => navigate("/exam")}>
        Start Test
      </button>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 30px",
    fontSize: "18px",
    background: "#22c55e",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Dashboard;