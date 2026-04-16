import { createContext, useContext, useState, type ReactNode } from "react";

type Interview = {
  id: number;
  name: string;
  role: string;
  status: string;
  date: string;
  score?: number;
};

type Probation = {
  id: number;
  name: string;
  role: string;
  dueDate: string;
};

type ManagerContextType = {
  interviews: Interview[];
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;
  probation: Probation[];
  setProbation: React.Dispatch<React.SetStateAction<Probation[]>>;
};

const ManagerContext = createContext<ManagerContextType | null>(null);

export const ManagerProvider = ({ children }: { children: ReactNode }) => {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: 1,
      name: "Trần Thị B",
      role: "Frontend Dev",
      status: "Chờ xác nhận",
      date: "25/04/2026",
    },
    {
      id: 2,
      name: "Lê Văn C",
      role: "UX/UI Designer",
      status: "Chờ xác nhận",
      date: "25/04/2026",
    },
    {
      id: 5,
      name: "Lê Văn C",
      role: "UX/UI Designer",
      status: "Chờ xác nhận",
      date: "25/04/2026",
    },
    {
      id: 3,
      name: "Lê Văn C",
      role: "UX/UI Designer",
      status: "Chờ xác nhận",
      date: "25/04/2026",
    },
    {
      id: 4,
      name: "Lê Văn C",
      role: "UX/UI Designer",
      status: "Chờ xác nhận",
      date: "25/04/2026",
    },
  ]);

  const [probation, setProbation] = useState<Probation[]>([
    {
      id: 1,
      name: "Hoàng Thị E",
      role: "Marketing",
      dueDate: "20/04/2026",
    },
    {
      id: 2,
      name: "Vũ Văn F",
      role: "Sales",
      dueDate: "27/04/2026",
    },
  ]);

  return (
    <ManagerContext.Provider
      value={{ interviews, setInterviews, probation, setProbation }}
    >
      {children}
    </ManagerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useManager = () => {
  const context = useContext(ManagerContext);
  if (!context) {
    throw new Error("useManager must be used inside ManagerProvider");
  }
  return context;
};
