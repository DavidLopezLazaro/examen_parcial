import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import axios from "axios";

type Team = {
  id: number;
  name: string;
  city: string;
  titles: number;
};

// Base de datos simulada
let teams: Team[] = [
  { id: 1, name: "Lakers", city: "Los Angeles", titles: 17 },
  { id: 2, name: "Celtics", city: "Boston", titles: 17 },
];

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Middleware de manejo de errores
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error detectado:", err.message);
  res.status(500).json({ error: "Error interno del servidor", detail: err.message });
};

app.get("/teams", (req: Request, res: Response) => {
  res.json(teams);
});

app.get("/teams/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const team = teams.find((t) => t.id === id);

  return team
    ? res.json(team)
    : res.status(404).json({ error: "Equipo no encontrado" });
});

app.post("/teams", (req: Request, res: Response) => {
  try {
    const newTeam: Team = {
      id: Date.now(),
      ...req.body,
    };

    teams.push(newTeam);
    res.status(201).json(newTeam);
  } catch (err: any) {
    res.status(500).json({ error: "Error al crear el equipo", detail: err.message });
  }
});

app.delete("/teams/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const exists = teams.some((t) => t.id === id);

    if (!exists)
      return res.status(404).json({ error: "Equipo no encontrado" });

    teams = teams.filter((t) => t.id !== id);

    res.json({ message: "Equipo eliminado correctamente" });
  } catch (err: any) {
    res.status(500).json({ error: "Error al eliminar el equipo", detail: err.message });
  }
});

app.use(errorHandler);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const testApi=async()=> {
  await delay(1000);

  const baseURL = "http://localhost:" + port;

  try {
  
    const initial = await axios.get<Team[]>(baseURL + "/teams");
    console.log("Lista inicial:", initial.data);

  
    const toCreate = { name: "Bulls", city: "Chicago", titles: 6 };
    const created = await axios.post<Team>(baseURL + "/teams", toCreate);
    console.log("Equipo creado:", created.data);

  
    const afterCreate = await axios.get<Team[]>(baseURL + "/teams");
    console.log("Lista tras crear:", afterCreate.data);

    await axios.delete(baseURL + "/teams/" + created.data.id);
    console.log("Equipo con id=" + created.data.id + " eliminado.");

    const finalList = await axios.get<Team[]>(baseURL + "/teams");
    console.log("Lista final:", finalList.data);
  } catch (err: any) {
    console.error("Fallo en Axios:", err.message);
  }
}

app.listen(port, async () => {
  console.log("Servidor iniciado en http://localhost:" + port);
  await testApi();
});


