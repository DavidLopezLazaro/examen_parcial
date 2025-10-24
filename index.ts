//
//git add .
//git commit -m "Solución del examen parcial"
//git branch -M main
//git remote add origin git@github.com:DavidLopezLazaro/examen_parcial.git
//git push -u origin main

import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import axios from "axios";

type LD = {
  id: number
  filmName: string
  rotationType: string, // "CAV" | "CLV"
  region: string,
  lengthMinutes: number,
  videoFormat: string // “NTSC” | “PAL”
}

let discs: LD[] = [
  { id: 1, filmName: "Interstellar", rotationType: "CAV", region: "MAD", lengthMinutes: 181, videoFormat: "NTSC" },
  { id: 2, filmName: "Inception", rotationType: "CLV", region: "LON", lengthMinutes: 149, videoFormat: "PAL" },
  { id: 3, filmName: "Dark Knight", rotationType: "CLV", region: "LON", lengthMinutes: 121, videoFormat: "PAL" },
];

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/discs", (req: Request, res: Response) => {
  res.json(discs);
});

app.get("/discs/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const team = discs.find((t) => t.id === id);

  return team
    ? res.json(team)
    : res.status(404).json({ error: "Disco no encontrado" });
});

app.post("/discs", (req: Request, res: Response) => {
  try {
    const newDisc: LD = {
      id: Date.now(),
      ...req.body,
    };

    discs.push(newDisc);
    res.status(201).json(newDisc);
  } catch (err: any) {
    res.status(500).json({ error: "Error al crear el disco", detail: err.message });
  }
});

app.delete("/discs/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const exists = discs.some((t) => t.id === id);

    if (!exists)
      return res.status(404).json({ error: "Disco no encontrado" });

    discs = discs.filter((t) => t.id !== id);

    res.json({ message: "Disco eliminado correctamente" });
  } catch (err: any) {
    res.status(500).json({ error: "Error al eliminar el disco", detail: err.message });
  }
});


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const testApi=async()=> {
  await delay(1000);

  const baseURL = "http://localhost:" + port;

  try {
  
    const initial = await axios.get<LD[]>(baseURL + "/discs");
    console.log("Lista inicial:", initial.data);

  
    const toCreate = { id: 4, filmName: "Dunkink", rotationType: "CLV", region: "BER", lengthMinutes: 171, videoFormat: "PAL" };
    const created = await axios.post<LD>(baseURL + "/discs", toCreate);
    console.log("Disco creado:", created.data);

  
    const afterCreate = await axios.get<LD[]>(baseURL + "/discs");
    console.log("Lista tras crear:", afterCreate.data);

    await axios.delete(baseURL + "/discs/" + created.data.id);
    console.log("Disco con id=" + created.data.id + " eliminado.");

    const finalList = await axios.get<LD[]>(baseURL + "/discs");
    console.log("Lista final:", finalList.data);
  } catch (err: any) {
    console.error("Fallo en Axios:", err.message);
  }
}

app.listen(port, async () => {
  console.log("Servidor iniciado en http://localhost:" + port);
  await testApi();
});


