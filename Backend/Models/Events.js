import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
        },

        eventType: {
            type: String,
            required: true,
            enum: [
                "attempt.succeeded",
                "attempt.rejected",
            ],
        },

        tenantId: {
            type: Number,
            required: true,
        },

        studentId: {
            type: Number,
            required: false,
        },

        attemptId: {
            type: Number,
            required: false,
        },

        requestId: {
            type: String,
            required: true,
        },

        occurredAt: {
            type: Date,
            default: Date.now,
        },

        metadata: {
            type: Object,
            default: {},
        },
    },
    {
        versionKey: false,
    }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;