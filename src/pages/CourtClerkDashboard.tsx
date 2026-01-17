import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Scale, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const CourtClerkDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Court Clerk Dashboard
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Pending Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-accent" />
            <span>15</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processed Cases</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Scale className="w-6 h-6 text-accent" />
            <span>20</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Judges</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <User className="w-6 h-6 text-accent" />
            <span>4</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Scale className="w-6 h-6 text-accent" />
            <span>In Progress</span>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Process Document</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Upload and verify court documents.</p>
            <Button variant="outline" className="mt-4">Process</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Assign Judge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Assign judges to pending cases.</p>
            <Button variant="outline" className="mt-4">Assign</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CourtClerkDashboard;
