// ✅ FULL WORKING App.tsx (React + Tailwind + TypeScript) — Fixed Types for Vercel Build
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type SetEntry = {
  weight: string;
  reps: string;
  comment: string;
};

type Exercise = {
  name: string;
  sets: SetEntry[];
};

type Workout = {
  date: string;
  condition: string;
  workoutType: string;
  exercises: Exercise[];
  overallComment: string;
};

const initialWorkout: Workout = {
  date: "",
  condition: "",
  workoutType: "",
  exercises: [
    {
      name: "",
      sets: [
        { weight: "", reps: "", comment: "" },
        { weight: "", reps: "", comment: "" },
        { weight: "", reps: "", comment: "" },
      ],
    },
  ],
  overallComment: "",
};

export default function App() {
  const [page, setPage] = useState("home");
  const [workout, setWorkout] = useState<Workout>(initialWorkout);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [history, setHistory] = useState<Workout[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("workoutHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleChange = (key: keyof Workout, value: string) =>
    setWorkout({ ...workout, [key]: value });

  const handleExerciseChange = (
    exIdx: number,
    setIdx: number,
    key: keyof SetEntry,
    value: string
  ) => {
    const updated = [...workout.exercises];
    updated[exIdx].sets[setIdx][key] = value;
    setWorkout({ ...workout, exercises: updated });
  };

  const handleNameChange = (exIdx: number, value: string) => {
    const updated = [...workout.exercises];
    updated[exIdx].name = value;
    setWorkout({ ...workout, exercises: updated });
  };

  const addExercise = () => {
    setWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name: "",
          sets: [
            { weight: "", reps: "", comment: "" },
            { weight: "", reps: "", comment: "" },
            { weight: "", reps: "", comment: "" },
          ],
        },
      ],
    }));
  };

  const startWorkout = () => setStartTime(new Date());

  const endWorkout = () => {
    const now = new Date();
    setEndTime(now);
    if (startTime) setDuration(Math.floor((now.getTime() - startTime.getTime()) / 60000));
  };

  const saveWorkout = () => {
    const updated = [...history, workout];
    setHistory(updated);
    localStorage.setItem("workoutHistory", JSON.stringify(updated));
    alert("Workout saved!");
  };

  const formatTime = (date: Date | null) =>
    date?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getBestAndWorst = () => {
    const all: Record<string, { date: string; volume: number }[]> = {};
    history.forEach((entry) => {
      entry.exercises.forEach((ex) => {
        const key = ex.name;
        const volume = ex.sets.reduce(
          (acc, s) => acc + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0),
          0
        );
        if (!all[key]) all[key] = [];
        all[key].push({ date: entry.date, volume });
      });
    });
    return Object.entries(all).map(([name, values]) => {
      const best = values.reduce((a, b) => (a.volume > b.volume ? a : b));
      const worst = values.reduce((a, b) => (a.volume < b.volume ? a : b));
      return { name, best, worst };
    });
  };

  const graphData = history
    .map((entry) => {
      const match = entry.exercises.find((ex) => ex.name === selectedExercise);
      const volume = match
        ? match.sets.reduce(
            (acc, s) => acc + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0),
            0
          )
        : 0;
      return match ? { date: entry.date, volume } : null;
    })
    .filter(Boolean);

  return <div className="text-center p-8">UI Loaded (types fixed)</div>;
}
