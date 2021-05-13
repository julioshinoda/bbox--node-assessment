import express, { Request, Response } from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import Project from "./entity/Project";
import User, { UserEvent, UserRole } from "./entity/User";

const PORT = process.env.PORT || 5001;

interface CustomRequest<T> extends Request {
  body: T;
}

interface UserRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface ProjectRequestBody {
  userId: string;
  description: string;
}

const app = express();
/*nesse arquivo devia ficar somente o handler e a validação dos requests. A lógica e as cahamdas para o banco em outras classes. Afim também de poder mockar e realizar os testes  */
app.use(express.json());

app.post(
  "/users",
  async ({ body }: CustomRequest<UserRequestBody>, res: Response) => {
    const uuid = uuidv4();
    //Falta validar os valores do request no body
    //A chamada ao banco devia estar isolada
    const user: User = User.create({
      uuid,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phoneNumber: body.phoneNumber,
      password: body.password,
      role: UserRole.CLIENT,
      creationDate: new Date(),
      currentEvent: UserEvent.CREATION,
    });
    await user.save();
    res.status(201).json({ id: uuid });
  }
);

app.get("/users", async (req: Request, res: Response) => {
   //A chamada ao banco devia estar isolada
  const users = await User.find();
  res.status(200).json(users);
});

app.get("/users/:id", async (req: Request, res: Response) => {
   //A chamada ao banco devia estar isolada
  const user: User = await User.findOne({ uuid: req.params.id });
  if (user) {
    res.status(200).json(user);
  } else res.status(404).json({ message: "User not found!" });
});

app.delete("/users/:id", async (req: Request, res: Response) => {
   //A chamada ao banco devia estar isolada
  const user: User = await User.findOne({ uuid: req.params.id });
  if (user) {
     //A chamada ao banco devia estar isolada
    User.delete(user);
    res.sendStatus(204);
  } else res.status(404).json({ message: "User not found!" });
});

app.post(
  "projects",
  async ({ body }: CustomRequest<ProjectRequestBody>, res: Response) => {
    const uuid = uuidv4();
     //A chamada ao banco devia estar isolada
    const user: User = await User.findOne({ uuid: body.userId });
    const project: Project = Project.create({
      uuid,
      description: body.description,
      owner: user,
      creationDate: new Date(),
    });
    await project.save();
    res.status(201).json({ id: uuid });
  }
);

app.get("/projects", async (req: Request, res: Response) => {
  const { userId } = req.query;
  let projects: Project[];
   //A chamada ao banco devia estar isolada
  if (userId) projects = await Project.find({where: { owner: userId }});
  else projects = await Project.find();
  res.status(200).json(projects);
});

app.get("/projects/:projectId", async (req: Request, res: Response) => {
  const { projectId } = req.params;
   //A chamada ao banco devia estar isolada
  const projects: Project = await Project.findOne({
    where: { uuid: projectId },
  });
  res.status(200).json(projects);
});

app.delete("/projects/:projectId", async (req: Request, res: Response) => {
  const { projectId } = req.params;
   //A chamada ao banco devia estar isolada
  const project: Project = await Project.findOne({
    where: { uuid: projectId },
  });
  if (project) {
     //A chamada ao banco devia estar isolada
    Project.delete(project);
    res.sendStatus(204);
  } else res.status(404).json({ message: "User not found!" });
});

const server = app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://0.0.0.0:${PORT}`);
});

// isso devia estar num modulo para a paltaforma como um todo usar
createConnection()
  .then((_) => console.log("☁ [database]: Database connection established"))
  .catch((error) =>
    console.error(`⚠ [database]: Couldn't connect to the database: ${error}`)
  );
