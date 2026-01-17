import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Gavel, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";

const JudgeDashboard = () => {
  // Get the logged-in user
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const stats = [
    { title: "Cases for Review", value: "12", icon: FileText, trend: "5 urgent", color: "primary" as const },
    { title: "Hearings Today", value: "4", icon: Calendar, trend: "Next at 10:00", color: "secondary" as const },
    { title: "Pending Rulings", value: "8", icon: Gavel, trend: "3 due this week", color: "accent" as const },
    { title: "Cases Closed (Month)", value: "23", icon: CheckCircle, trend: "+8 vs last month", color: "primary" as const },
  ];

  const pendingCases = [
    {
      id: "CASE-2024-045",
      title: "Commercial Dispute - ABC Corp vs XYZ Ltd",
      type: "Civil",
      priority: "High",
      filedDate: "Jan 8, 2024",
      parties: "ABC Corporation vs XYZ Limited",
      status: "Awaiting Ruling",
    },
    {
      id: "CASE-2024-032",
      title: "Criminal Defense - State vs Mugabo",
      type: "Criminal",
      priority: "Urgent",
      filedDate: "Jan 2, 2024",
      parties: "Republic of Rwanda vs Patrick Mugabo",
      status: "Evidence Review",
    },
    {
      id: "CASE-2024-028",
      title: "Family Matter - Inheritance Dispute",
      type: "Family",
      priority: "Normal",
      filedDate: "Dec 28, 2023",
      parties: "Uwimana Family",
      status: "Hearing Scheduled",
    },
  ];

  const todaySchedule = [
    { time: "10:00 AM", case: "ABC Corp vs XYZ", type: "Oral Arguments", room: "Courtroom 1" },
    { time: "11:30 AM", case: "State vs Mugabo", type: "Evidence Hearing", room: "Courtroom 1" },
    { time: "02:00 PM", case: "Uwimana Estate", type: "Preliminary", room: "Courtroom 2" },
    { time: "04:00 PM", case: "Land Registry Appeal", type: "Final Ruling", room: "Courtroom 1" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "destructive";
      case "High": return "default";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout role="judge" userName={user?.name} userPhoto={user?.profilePhoto}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            {/* Profile photo */}
            {user?.profilePhoto && (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Good Morning, {user ? user.name : "Hon. Justice"}
              </h1>
              <p className="text-muted-foreground">You have 4 hearings scheduled for today</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Court Calendar
            </Button>
            <Button className="gap-2">
              <Scale className="w-4 h-4" />
              Issue Ruling
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cases for Review */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cases Requiring Attention</h2>
              <Button variant="ghost" size="sm">View All Cases</Button>
            </div>
            <div className="space-y-4">
              {pendingCases.map((caseItem, index) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-5 border shadow-soft hover:shadow-card transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">{caseItem.id}</span>
                        <Badge variant={getPriorityColor(caseItem.priority)}>{caseItem.priority}</Badge>
                        <Badge variant="outline">{caseItem.type}</Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{caseItem.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{caseItem.parties}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Filed: {caseItem.filedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {caseItem.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="w-3 h-3" />
                        Review
                      </Button>
                      <Button size="sm" className="gap-1">
                        <Gavel className="w-3 h-3" />
                        Ruling
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-xl p-6 border shadow-soft">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Today's Schedule
              </h3>
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-primary">{item.time}</span>
                      <span className="text-xs text-muted-foreground">{item.room}</span>
                    </div>
                    <p className="text-sm font-medium">{item.case}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
              <h3 className="font-semibold mb-4">This Month's Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Cases Resolved</span>
                  <span className="font-bold">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Avg. Resolution Time</span>
                  <span className="font-bold">18 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Rulings Issued</span>
                  <span className="font-bold">31</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JudgeDashboard;
