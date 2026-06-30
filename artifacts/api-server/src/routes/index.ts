import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import candidatesRouter from "./candidates";
import rankingsRouter from "./rankings";
import rankRouter from "./rank";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/jobs", jobsRouter);
router.use("/candidates", candidatesRouter);
router.use("/rankings", rankingsRouter);
router.use("/rank", rankRouter);

export default router;
