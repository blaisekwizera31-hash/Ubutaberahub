import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";

const ClerkDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Get logged-in clerk info from localStorage
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const stats = [
    { title: "Pending Filings", value: "24", icon: FileText, trend: "8 today", color: "primary" as const },
    { title: "Processed Today", value: "18", icon: CheckCircle, trend: "+5 vs yesterday", color: "secondary" as const },
    { title: "Scheduled Hearings", value: "32", icon: Calendar, trend: "This week", color: "accent" as const },
    { title: "Document Requests", value: "7", icon: Upload, trend: "3 urgent", color: "primary" as const },
  ];

  const pendingFilings = [
    {
      id: "FILE-2024-156",
      title: "New Case Filing - Property Dispute",
      submittedBy: "Jean-Claude Mugisha",
      type: "Civil",
      date: "Jan 10, 2024",
      status: "Pending Review",
      documents: 5,
    },
    {
      id: "FILE-2024-155",
      title: "Appeal Submission - Criminal Case",
      submittedBy: "Me. Marie Uwimana",
      type: "Criminal",
      date: "Jan 10, 2024",
      status: "Documents Missing",
      documents: 3,
    },
    {
      id: "FILE-2024-154",
      title: "Evidence Submission - CASE-2024-032",
      submittedBy: "Me. Jean Habimana",
      type: "Evidence",
      date: "Jan 9, 2024",
      status: "Pending Review",
      documents: 8,
    },
    {
      id: "FILE-2024-153",
      title: "Motion for Extension",
      submittedBy: "Me. Patrick Nkurunziza",
      type: "Motion",
      date: "Jan 9, 2024",
      status: "Ready for Judge",
      documents: 2,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Review": return "default";
      case "Documents Missing": return "destructive";
      case "Ready for Judge": return "secondary";
      default: return "outline";
    }
  };

  return (
    <DashboardLayout role="clerk" userName={user?.name || "Court Clerk"}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            {/* Profile Photo */}
            
              <img
                src={user?.profilePhoto || "/avatar/avatar.png"}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Good Morning, {user?.name || "Diane"}!
              </h1>
              <p className="text-muted-foreground">You have 24 pending filings to process</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Hearing
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              New Filing
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

        {/* Filings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border shadow-soft"
        >
          <div className="p-4 md:p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Pending Filings</h2>
              <div className="flex gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search filings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Filing ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Submitted By</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingFilings.map((filing) => (
                  <tr key={filing.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-sm">{filing.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{filing.title}</p>
                        <p className="text-sm text-muted-foreground">{filing.documents} documents</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{filing.submittedBy}</td>
                    <td className="p-4">
                      <Badge variant="outline">{filing.type}</Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{filing.date}</td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(filing.status)}>{filing.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <XCircle className="w-4 h-4" />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <FileText className="w-4 h-4" />
                              Request Documents
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing 4 of 24 filings</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;
