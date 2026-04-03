import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ObjectiveProgressItem {
  title: string;
  progress: number;
  completed: number;
  total: number;
  dueDate: string;
  status: "Completed" | "On Track" | "At Risk" | "Behind";
}

interface OKRProgressProps {
  objectives: ObjectiveProgressItem[];
}

export function OKRProgress({ objectives }: OKRProgressProps) {
  const navigate = useNavigate();

  const getStatus = (status: ObjectiveProgressItem["status"]) => {
    if (status === "Completed") {
      return {
        label: "Completed",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    }

    if (status === "On Track") {
      return {
        label: "On Track",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Circle className="w-4 h-4 fill-blue-500" />,
      };
    }

    if (status === "At Risk") {
      return {
        label: "At Risk",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <AlertTriangle className="w-4 h-4" />,
      };
    }

    return {
      label: "Behind",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: <XCircle className="w-4 h-4" />,
    };
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-primary";
    if (progress >= 70) return "bg-primary";
    if (progress >= 50) return "bg-chart-4";
    return "bg-destructive";
  };

  return (
    <Card className="col-span-1 lg:col-span-3 h-full">
      <CardHeader>
        <CardTitle>OKR Progress Tracker - Q1 2026</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {objectives.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No objectives available yet.
          </p>
        )}
        {objectives.map((obj) => {
          const status = getStatus(obj.status);
          const progressColor = getProgressColor(obj.progress);

          return (
            <div
              key={obj.title}
              className="flex flex-col gap-3 p-4 rounded-lg border bg-card/50"
            >
             
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm leading-tight">
                  {obj.title}
                </h4>
                <Badge
                  variant="outline"
                  className={`shrink-0 ${status.color} border-0`}
                >
                  {status.icon} <span className="ml-1">{status.label}</span>
                </Badge>
              </div>

              {/* Progress Bar Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{obj.progress}%</span>
                </div>

                <Progress
                  value={obj.progress}
                  className={`h-2 [&>div]:${progressColor}`}
                />
              </div>

              {/* Footer*/}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span className="flex items-center">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {obj.completed} of {obj.total} Key Results
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {obj.dueDate}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <Button
          variant="ghost"
          className="w-full text-sm text-muted-foreground"
          onClick={() => navigate("/okrs")}
        >
          View All OKRs <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
