import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Scale, Briefcase, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const LawyerDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Lawyer Dashboard</h1>
        <Button variant="secondary">
          <Link to="/">Logout</Link>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <User className="w-6 h-6 text-accent" />
            <span className="text-lg font-semibold">12</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Cases</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Briefcase className="w-6 h-6 text-accent" />
            <span className="text-lg font-semibold">5</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-accent" />
            <span className="text-lg font-semibold">8</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Scale className="w-6 h-6 text-accent" />
            <span className="text-lg font-semibold">$4,500</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Add New Case</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Create a new client case and assign documents.</p>
            <Button variant="outline" className="mt-4">Add Case</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>View Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">See all your clients and active cases in one place.</p>
            <Button variant="outline" className="mt-4">View Clients</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LawyerDashboard;
