import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./judge.css";

interface CaseType {
  caseNumber: string;
  status: string;
  type: string;
  title: string;
  court: string;
  nextHearing?: string;
  hearingTime?: string;
  room?: string;
  filedDate: string;
  dueDate?: string;
  rulingDate?: string;
  judge: string;
}

const JudgeDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [assignedCases, setAssignedCases] = useState<CaseType[]>([]);
  const [hearingsToday, setHearingsToday] = useState<CaseType[]>([]);
  const [pendingRulings, setPendingRulings] = useState<CaseType[]>([]);
  const [timelinessRate, setTimelinessRate] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("loggedInUser") || "null"
    );

    // not logged in
    if (!storedUser) {
      navigate("/auth");
      return;
    }

    // wrong role
    if (storedUser.role !== "Judge") {
      navigate("/");
      return;
    }

    setUser(storedUser);

    const allCases: CaseType[] =
      JSON.parse(localStorage.getItem("cases") || "[]");

    const mine = allCases.filter(
      (c) => c.judge === storedUser.name
    );
    setAssignedCases(mine);

    const today = new Date().toISOString().split("T")[0];
    setHearingsToday(mine.filter((c) => c.nextHearing === today));

    const pending = mine.filter((c) => c.status === "Pending Ruling");
    setPendingRulings(pending);

    const delivered = mine.filter(
      (c) => c.status === "Ruling Delivered"
    );

    const onTime = delivered.filter(
      (c) =>
        c.rulingDate &&
        c.dueDate &&
        new Date(c.rulingDate) <= new Date(c.dueDate)
    );

    setTimelinessRate(
      delivered.length === 0
        ? 0
        : Math.round((onTime.length / delivered.length) * 100)
    );
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="brand">⚖ Justice Connect</h2>
        <nav>
          <a className="active">Dashboard</a>
          <a>Cases</a>
          <a>Hearings</a>
          <a>Rulings</a>
          <a>Messages</a>
          <a>Documents</a>
          <a>Schedule</a>
          <a>AI Assistant</a>
          <a>Settings</a>
          <a>Help Center</a>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h1>Welcome, Honorable {user.name}</h1>
            <p>Justice Dashboard • UBUTABERAhub</p>
          </div>

          <div className="profile">
            <img
              src={user.photo || "/default-avatar.png"}
              alt="profile"
            />
            <div>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="summary">
          <div className="card">
            <h3>{assignedCases.length}</h3>
            <p>Cases Assigned</p>
            <span>Active cases</span>
          </div>

          <div className="card">
            <h3>{hearingsToday.length}</h3>
            <p>Hearings Today</p>
          </div>

          <div className="card">
            <h3>{pendingRulings.length}</h3>
            <p>Pending Rulings</p>
            <span>Due soon</span>
          </div>

          <div className="card">
            <h3>{timelinessRate}%</h3>
            <p>Timeliness Rate</p>
          </div>
        </section>

        {/* CASES */}
        <section className="cases">
          <h2>Cases in Progress</h2>

          {assignedCases.map((c) => (
            <div className="case" key={c.caseNumber}>
              <h3>
                {c.caseNumber} ({c.status})
              </h3>
              <p>
                {c.type} - {c.title}
              </p>
              <small>
                {c.court} | Next Hearing:{" "}
                {c.nextHearing || "TBD"} | Filed: {c.filedDate}
              </small>
            </div>
          ))}
        </section>

        {/* HEARINGS */}
        <section className="hearings">
          <h2>Today’s Hearings</h2>
          <ul>
            {hearingsToday.length === 0 && (
              <li>No hearings today</li>
            )}

            {hearingsToday.map((c) => (
              <li key={c.caseNumber}>
                {c.hearingTime || "--:--"}: {c.title} (
                {c.court}, Room {c.room || "-"})
              </li>
            ))}
          </ul>
        </section>

        {/* RULINGS */}
        <section className="rulings">
          <h2>Pending Rulings</h2>

          {pendingRulings.length === 0 && (
            <p>No pending rulings</p>
          )}

          {pendingRulings.map((c) => (
            <div className="ruling" key={c.caseNumber}>
              <strong>{c.caseNumber}</strong>
              <p>
                {c.type} - {c.title}
                <span>Due: {c.dueDate}</span>
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default JudgeDashboard;
