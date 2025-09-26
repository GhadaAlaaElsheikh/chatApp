"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)("./config/.env.development") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const modules_1 = require("./modules");
const error_response_1 = require("./utils/response/error.response");
const database_connection_1 = require("./database/database.connection");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const socket_io_1 = require("socket.io");
const createS3WriteStreamPipe = (0, node_util_1.promisify)(node_stream_1.pipeline);
const connectedSocket = [];
const bootstrap = async () => {
    const port = process.env.PORT || 5000;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 60 * 60000,
        limit: 2000,
        message: { error: "too many request please try again" },
        statusCode: 429,
    });
    app.use(limiter);
    app.get("/", (req, res) => {
        res.json({ message: `welcome ${process.env.APPLICATION_NAME}` });
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.userRouter);
    app.use("/post", modules_1.postRouter);
    app.use(error_response_1.globalErrorHandling);
    await (0, database_connection_1.connectDB)();
    const httpServer = app.listen(port, () => {
        console.log(`server is running on port :: ${port}`);
    });
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*"
        },
    });
    io.on("connection", (socket) => {
        console.log(socket.id);
        socket.on("sayHi", (data, callback) => {
            console.log({ data });
            callback("hello BE to FE");
        });
        io.except(connectedSocket)
            .emit("productStock", {
            productId: "D32r32",
            quentity: 5,
        }, (res) => {
            console.log({ res });
        });
        socket.on("disconnect", () => {
            console.log(`logout from :: ${socket.id}`);
        });
    });
    io.of("/admin").on("connection", (socket) => {
        console.log("admin  ", socket.id);
        socket.on("disconnect", () => {
            console.log(`logout from :: ${socket.id}`);
        });
    });
};
exports.default = bootstrap;
