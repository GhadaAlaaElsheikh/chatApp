"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = void 0;
const mongoose_1 = require("mongoose");
const friendRequestSchema = new mongoose_1.Schema({
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    sendTo: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    acceeptedAt: Date,
}, {
    timestamps: true,
    strictQuery: true,
});
friendRequestSchema.pre(["findOne", "find", "countDocuments"], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    console.log(this.getQuery);
    next();
});
friendRequestSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
friendRequestSchema.virtual("reply", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    justOne: true,
});
exports.FriendRequestModel = mongoose_1.models.Comment || (0, mongoose_1.model)("FriendRequest", friendRequestSchema);
