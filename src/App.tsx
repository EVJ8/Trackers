// ✅ FULL App.tsx (React + Tailwind + TypeScript)
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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4">
      {page === "home" && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-4xl font-bold mb-6">🏋️ Gym Tracker</h1>
          <button
            className="mb-4 px-6 py-3 bg-blue-600 text-white rounded"
            onClick={() => setPage("tracker")}
          >
            ▶️ Start Workout
          </button>
          <button
            className="px-6 py-3 bg-green-600 text-white rounded"
            onClick={() => setPage("progress")}
          >
            📈 Progress
          </button>
        </div>
      )}

      {page === "tracker" && (
        <div>
          <button className="text-blue-600" onClick={() => setPage("home")}>← Back</button>
          <h2 className="text-xl font-bold my-4">🏋️ Workout Tracker</h2>

          <input className="border p-2 w-full mb-2" placeholder="📅 Date" value={workout.date} onChange={(e) => handleChange("date", e.target.value)} />
          <input className="border p-2 w-full mb-2" placeholder="😴 Condition" value={workout.condition} onChange={(e) => handleChange("condition", e.target.value)} />
          <input className="border p-2 w-full mb-4" placeholder="💪 Workout Type" value={workout.workoutType} onChange={(e) => handleChange("workoutType", e.target.value)} />

          {workout.exercises.map((ex, exIdx) => (
            <div key={exIdx} className="bg-white p-4 rounded shadow mb-4">
              <input
                className="font-bold border-b w-full mb-2"
                placeholder="Exercise"
                value={ex.name}
                onChange={(e) => handleNameChange(exIdx, e.target.value)}
              />
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex gap-2 mb-2">
                  <input className="w-16 border p-2" placeholder="W" value={set.weight} onChange={(e) => handleExerciseChange(exIdx, setIdx, "weight", e.target.value)} />
                  <input className="w-16 border p-2" placeholder="R" value={set.reps} onChange={(e) => handleExerciseChange(exIdx, setIdx, "reps", e.target.value)} />
                  <input className="flex-1 border p-2" placeholder="Comment" value={set.comment} onChange={(e) => handleExerciseChange(exIdx, setIdx, "comment", e.target.value)} />
                </div>
              ))}
            </div>
          ))}

          <button onClick={addExercise} className="w-full mb-4 py-2 bg-purple-600 text-white rounded">
            ➕ Add Exercise
          </button>

          <textarea
            className="border p-2 w-full mb-4"
            placeholder="📝 Overall Comments"
            value={workout.overallComment}
            onChange={(e) => handleChange("overallComment", e.target.value)}
          />

          <div className="flex gap-4 mb-4">
            <button className="flex-1 py-2 bg-green-500 text-white rounded" onClick={startWorkout}>▶️ Start</button>
            <button className="flex-1 py-2 bg-red-500 text-white rounded" onClick={endWorkout}>⏹️ End</button>
          </div>
          {startTime && <p>Start: {formatTime(startTime)}</p>}
          {endTime && <p>End: {formatTime(endTime)}</p>}
          {duration !== null && <p>🕒 {duration} mins</p>}

          <button className="w-full py-2 bg-blue-600 text-white rounded" onClick={saveWorkout}>💾 Save Workout</button>
        </div>
      )}

      {page === "progress" && (
        <div>
          <button className="text-blue-600" onClick={() => setPage("home")}>← Back</button>
          <h2 className="text-xl font-bold my-4">📈 Progress</h2>

          <label>Exercise for Graph:</label>
          <select className="w-full p-2 border rounded mb-4" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
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
              <strong>{name}</strong><br />
              Best: {best.volume} ({best.date})<br />
              Worst: {worst.volume} ({worst.date})
            </div>
          ))}

          <div className="mt-6">
            <button onClick={() => {
              const wsData = [
                ["Date", "Condition", "Workout Type", "Exercise", "Set 1", "Comment 1", "Set 2", "Comment 2", "Set 3", "Comment 3", "Overall Comment"],
              ];
              history.forEach((entry) => {
                entry.exercises.forEach((ex) => {
                  const row = [
                    entry.date,
                    entry.condition,
                    entry.workoutType,
                    ex.name,
                    `${ex.sets[0].weight}x${ex.sets[0].reps}`,
                    ex.sets[0].comment,
                    `${ex.sets[1].weight}x${ex.sets[1].reps}`,
                    ex.sets[1].comment,
                    `${ex.sets[2].weight}x${ex.sets[2].reps}`,
                    ex.sets[2].comment,
                    entry.overallComment,
                  ];
                  wsData.push(row);
                });
              });
              const wb = XLSX.utils.book_new();
              const ws = XLSX.utils.aoa_to_sheet(wsData);
              XLSX.utils.book_append_sheet(wb, ws, "Workout Log");
              XLSX.writeFile(wb, "Workout_History.xlsx");
            }} className="mr-4 py-2 px-4 bg-blue-600 text-white rounded">
              📤 Export
            </button>
            <label className="inline-block py-2 px-4 bg-gray-300 text-gray-800 rounded cursor-pointer">
              📥 Import
              <input type="file" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  const bstr = evt.target?.result as string;
                  const wb = XLSX.read(bstr, { type: "binary" });
                  const ws = wb.Sheets[wb.SheetNames[0]];
                  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
                  const newHistory: Workout[] = data.slice(1).map((row) => ({
                    date: row[0],
                    condition: row[1],
                    workoutType: row[2],
                    exercises: [
                      {
                        name: row[3],
                        sets: [
                          { weight: row[4]?.split("x")[0] || "", reps: row[4]?.split("x")[1] || "", comment: row[5] },
                          { weight: row[6]?.split("x")[0] || "", reps: row[6]?.split("x")[1] || "", comment: row[7] },
                          { weight: row[8]?.split("x")[0] || "", reps: row[8]?.split("x")[1] || "", comment: row[9] },
                        ],
                      },
                    ],
                    overallComment: row[10] || "",
                  }));
                  setHistory(newHistory);
                  localStorage.setItem("workoutHistory", JSON.stringify(newHistory));
                  alert("Imported from Excel!");
                };
                reader.readAsBinaryString(file);
              }} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
