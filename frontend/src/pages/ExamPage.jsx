import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5000");

const ExamPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [warning, setWarning] = useState("Monitoring...");
  const [level, setLevel] = useState("low");
  const [terminated, setTerminated] = useState(false);

  const lastSpokenRef = useRef("");

  // Speak function(Ollama → Voice)
  const speak = (text) => {
    if (!text || text === lastSpokenRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesis.cancel(); 
    speechSynthesis.speak(utterance);

    lastSpokenRef.current = text;
  };

  // Webcam + mic
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera/Mic error:", err));
  }, []);

  // Send frames
  useEffect(() => {
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || terminated) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0);

      const frame = canvas.toDataURL("image/jpeg");
      socket.emit("video_frame", { frame });

    }, 1200);

    return () => clearInterval(interval);
  }, [terminated]);

  // Warning listener (speaks Ollama message)
  useEffect(() => {
    socket.on("warning", (data) => {
      setWarning(data.message);
      setLevel(data.level);

      speak(data.message); 
    });

    return () => socket.off("warning");
  }, []);

  useEffect(() => {
    socket.on("terminate_exam", (data) => {
      speak(data.message);
      alert(data.message);
      setTerminated(true);
    });

    return () => socket.off("terminate_exam");
  }, []);

  //Tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !terminated) {
        socket.emit("tab_switch", { event: "tab_switch" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [terminated]);

  //Mic detection
  useEffect(() => {
    let audioContext;
    let analyser;

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (terminated) return;

          analyser.getByteTimeDomainData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            let val = (dataArray[i] - 128) / 128;
            sum += val * val;
          }

          let volume = Math.sqrt(sum / dataArray.length);

          if (volume > 0.04) {
            socket.emit("audio_event", {
              event: "audio_detected",
              volume: volume
            });
          }

          requestAnimationFrame(checkAudio);
        };

        checkAudio();

      } catch (err) {
        console.error("Mic error:", err);
      }
    };

    startAudio();
  }, [terminated]);

  // Disable copy/paste/right-click/devtools
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      if (e.ctrlKey && ["c", "v", "x", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getColor = () => {
    if (level === "high") return "#ef4444";
    if (level === "medium") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Proctora AI - Exam Monitoring</h2>

      {terminated ? (
        <div style={styles.terminated}>
          🚫 Exam Terminated
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline style={styles.video} />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Register Face */}
          <button
            style={styles.button}
            onClick={() => {
              const canvas = canvasRef.current;
              const frame = canvas.toDataURL("image/jpeg");
              socket.emit("register_face", { frame });
            }}
          >
            Register Face
          </button>

          {/* Warning */}
          <div style={{ ...styles.warningBox, background: getColor() }}>
            ⚠️ {warning}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    background: "#0f172a",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  video: {
    width: "500px",
    borderRadius: "12px",
    marginTop: "20px",
    border: "3px solid #1f2937",
  },
  warningBox: {
    marginTop: "20px",
    padding: "12px 25px",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  terminated: {
    marginTop: "50px",
    fontSize: "28px",
    color: "#ef4444",
    fontWeight: "bold",
  }
};

export default ExamPage;