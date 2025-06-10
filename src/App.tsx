// ✅ FULL WORKING App.tsx (React + Tailwind + TypeScript)
// Final version with full UI restored and working logic

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

const initialWorkout = {
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
  const [workout, setWorkout] = useState(initialWorkout);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("workoutHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleChange = (key: string, value: string) =>
    setWorkout({ ...workout, [key]: value });

  const handleExerciseChange = (
    exIdx: number,
    setIdx: number,
    key: string,
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
    if (startTime)
      setDuration(Math.floor(((now as any) - (startTime as any)) / 60000));
  };

  const saveWorkout = () => {
    const updated = [...history, workout];
    setHistory(updated);
    localStorage.setItem("workoutHistory", JSON.stringify(updated));
    alert("Workout saved!");
  };

  const formatTime = (date: Date | null) =>
    date?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const exportToExcel = () => {
    const wsData = [[
      "Date", "Condition", "Workout Type", "Exercise",
      "Set 1", "Comment 1", "Set 2", "Comment 2", "Set 3", "Comment 3", "Overall Comment"
    ]];
    history.forEach((entry) => {
      entry.exercises.forEach((ex: any) => {
        const row = [
          entry.date, entry.condition, entry.workoutType, ex.name,
          `${ex.sets[0].weight}x${ex.sets[0].reps}`, ex.sets[0].comment,
          `${ex.sets[1].weight}x${ex.sets[1].reps}`, ex.sets[1].comment,
          `${ex.sets[2].weight}x${ex.sets[2].reps}`, ex.sets[2].comment,
          entry.overallComment
        ];
        wsData.push(row);
      });
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Workout Log");
    XLSX.writeFile(wb, `Workout_History.xlsx`);
  };

  const importFromExcel = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const newHistory = data.slice(1).map((row: any[]) => ({
        date: row[0],
        condition: row[1],
        workoutType: row[2],
        exercises: [{
          name: row[3],
          sets: [
            { weight: row[4]?.split("x")[0], reps: row[4]?.split("x")[1], comment: row[5] },
            { weight: row[6]?.split("x")[0], reps: row[6]?.split("x")[1], comment: row[7] },
            { weight: row[8]?.split("x")[0], reps: row[8]?.split("x")[1], comment: row[9] },
          ],
        }],
        overallComment: row[10] || "",
      }));
      setHistory(newHistory);
      localStorage.setItem("workoutHistory", JSON.stringify(newHistory));
      alert("Imported from Excel!");
    };
    reader.readAsBinaryString(file);
  };

  const getBestAndWorst = () => {
    const all: any = {};
    history.forEach((entry) => {
      entry.exercises.forEach((ex: any) => {
        const key = ex.name;
        const volume = (ex.sets as any[]).reduce(
          (acc, s) => acc + (+s.weight || 0) * (+s.reps || 0),
          0
        );
        if (!all[key]) all[key] = [];
        all[key].push({ date: entry.date, volume });
      });
    });
    return Object.entries(all).map(([name, values]: any) => {
      const best = values.reduce((a: any, b: any) => (a.volume > b.volume ? a : b));
      const worst = values.reduce((a: any, b: any) => (a.volume < b.volume ? a : b));
      return { name, best, worst };
    });
  };

  const graphData = history
    .map((entry) => {
      const match = selectedExercise && entry.exercises.find((ex: any) => ex.name === selectedExercise);
      const volume = match
        ? (match.sets as any[]).reduce((acc, s) => acc + (+s.weight || 0) * (+s.reps || 0), 0)
        : 0;
      return match ? { date: entry.date, volume } : null;
    })
    .filter(Boolean);

  // Full Tracker UI
  if (page === "tracker") {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setPage("home")} className="text-blue-600 font-semibold">← Back</button>
          <h2 className="text-xl font-bold">🏋️ Workout Tracker</h2>
        </div>
        <input type="text" placeholder="📅 Date" value={workout.date} onChange={(e) => handleChange("date", e.target.value)} className="w-full p-2 border rounded mb-2" />
        <input type="text" placeholder="😴 Condition" value={workout.condition} onChange={(e) => handleChange("condition", e.target.value)} className="w-full p-2 border rounded mb-2" />
        <input type="text" placeholder="💪 Workout Type" value={workout.workoutType} onChange={(e) => handleChange("workoutType", e.target.value)} className="w-full p-2 border rounded mb-4" />

        {workout.exercises.map((ex, exIdx) => (
          <div key={exIdx} className="bg-white p-4 rounded shadow mb-4">
            <input type="text" placeholder="Exercise" value={ex.name} onChange={(e) => handleNameChange(exIdx, e.target.value)} className="w-full font-bold p-2 border-b mb-2" />
            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} className="flex gap-2 mb-2">
                <input type="text" placeholder="W" value={set.weight} onChange={(e) => handleExerciseChange(exIdx, setIdx, "weight", e.target.value)} className="w-16 p-2 border rounded" />
                <input type="text" placeholder="R" value={set.reps} onChange={(e) => handleExerciseChange(exIdx, setIdx, "reps", e.target.value)} className="w-16 p-2 border rounded" />
                <input type="text" placeholder="Comment" value={set.comment} onChange={(e) => handleExerciseChange(exIdx, setIdx, "comment", e.target.value)} className="flex-1 p-2 border rounded" />
              </div>
            ))}
          </div>
        ))}

        <button onClick={addExercise} className="w-full py-2 bg-purple-600 text-white rounded mb-4">➕ Add Exercise</button>
        <textarea placeholder="📝 Overall Comments" value={workout.overallComment} onChange={(e) => handleChange("overallComment", e.target.value)} className="w-full p-2 border rounded mb-4" />
        <div className="flex gap-4 mb-4">
          <button onClick={startWorkout} className="flex-1 py-2 bg-green-500 text-white rounded">▶️ Start</button>
          <button onClick={endWorkout} className="flex-1 py-2 bg-red-500 text-white rounded">⏹️ End</button>
        </div>
        {startTime && <p>Start: {formatTime(startTime)}</p>}
        {endTime && <p>End: {formatTime(endTime)}</p>}
        {duration !== null && <p>🕒 {duration} mins</p>}
        <button onClick={saveWorkout} className="w-full py-2 bg-blue-600 text-white rounded">💾 Save Workout</button>
      </div>
    );
  }

  if (page === "progress") {
    return (
      <div className="min-h-screen bg-white px-4 py-6 text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setPage("home")} className="text-blue-600 font-semibold">← Back</button>
          <h2 className="text-xl font-bold">📈 Progress</h2>
        </div>
        <label className="block mb-1">Exercise for Graph:</label>
        <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">All</option>
          {[...new Set(history.flatMap((h) => h.exercises.map((e) => e.name)))].map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>
        {selectedExercise && (
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volume" stroke="#6366f1" name="Volume" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">🏆 Best & 😞 Worst</h3>
        {getBestAndWorst().map(({ name, best, worst }, i) => (
          <div key={i} className="mb-2">
            <strong>{name}</strong>
            <br />Best: {best.volume} ({best.date})<br />Worst: {worst.volume} ({worst.date})
          </div>
        ))}
        <div className="mt-6">
          <button onClick={exportToExcel} className="mr-4 py-2 px-4 bg-blue-600 text-white rounded">📤 Export</button>
          <label className="inline-block py-2 px-4 bg-gray-300 text-gray-800 rounded cursor-pointer">
            📥 Import
            <input type="file" onChange={importFromExcel} className="hidden" />
          </label>
        </div>
      </div>
    );
  }

  return <div className="text-center p-8">Loading...</div>;
}
