import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  FileText, 
  Users, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";
import CaseCard from "@/components/Dashboard/CaseCard";

const LawyerDashboard = () => {
  const stats = [
    { title: "Active Cases", value: "15", icon: Briefcase, trend: "+3 this month", color: "primary" as const },
    { title: "Clients", value: "28", icon: Users, trend: "+5 new", color: "secondary" as const },
    { title: "Hearings This Week", value: "6", icon: Calendar, trend: "2 tomorrow", color: "accent" as const },
    { title: "Success Rate", value: "87%", icon: TrendingUp, trend: "+2% this year", color: "primary" as const },
  ];

  const cases = [
    {
      id: "CASE-2024-045",
      title: "Commercial Dispute - ABC Corp vs XYZ Ltd",
      status: "In Progress" as const,
      date: "Jan 8, 2024",
      lawyer: "High Court, Kigali",
      nextHearing: "Jan 18, 2024",
    },
    {
      id: "CASE-2024-039",
      title: "Property Transfer - Uwimana Estate",
      status: "Pending" as const,
      date: "Jan 5, 2024",
      lawyer: "Primary Court, Gasabo",
      nextHearing: "Jan 22, 2024",
    },
    {
      id: "CASE-2024-032",
      title: "Criminal Defense - State vs Mugabo",
      status: "In Progress" as const,
      date: "Jan 2, 2024",
      lawyer: "Intermediate Court",
      nextHearing: "Jan 15, 2024",
    },
  ];

  const upcomingHearings = [
    { time: "09:00 AM", case: "ABC Corp vs XYZ", court: "High Court, Room 3" },
    { time: "11:30 AM", case: "State vs Mugabo", court: "Intermediate Court" },
    { time: "02:00 PM", case: "Uwimana Estate", court: "Primary Court" },
  ];

  return (
    <DashboardLayout role="lawyer" userName="Me. Jean Habimana">
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, Me. Habimana!</h1>
            <p className="text-muted-foreground">You have 6 hearings scheduled this week</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              View Schedule
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Client
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
          {/* Cases List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Cases</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {cases.map((caseItem, index) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CaseCard {...caseItem} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl p-6 border shadow-soft"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Today's Hearings
              </h3>
              <div className="space-y-4">
                {upcomingHearings.map((hearing, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-sm font-medium text-primary">{hearing.time}</div>
                    <div>
                      <p className="text-sm font-medium">{hearing.case}</p>
                      <p className="text-xs text-muted-foreground">{hearing.court}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Client Messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border shadow-soft"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-secondary" />
                Recent Messages
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Jean-Claude M.", message: "Thank you for the update...", time: "2h ago" },
                  { name: "Marie U.", message: "When is our next meeting?", time: "5h ago" },
                ].map((msg, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{msg.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3">View All Messages</Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;
