import { Clock, User, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CaseCardProps {
  id: string;
  title: string;
  status: "In Progress" | "Pending" | "Resolved";
  date: string;
  lawyer: string;
  nextHearing: string;
}

const statusColors = {
  "In Progress": "default",
  "Pending": "secondary",
  "Resolved": "outline",
} as const;

const CaseCard = ({ id, title, status, date, lawyer, nextHearing }: CaseCardProps) => {
  return (
    <div className="bg-card rounded-xl p-5 border shadow-soft hover:shadow-card transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-muted-foreground">{id}</span>
            <Badge variant={statusColors[status]}>{status}</Badge>
          </div>
          <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors">{title}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{lawyer}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Filed: {date}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Calendar className="w-4 h-4" />
              <span>Next Hearing: {nextHearing}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CaseCard;
