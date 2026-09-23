import Event from "../Models/Events.js";

export const createAttemptSuccessEvent = async ({
    tenantId,
    studentId,
    attemptId,
    requestId,
    idempotencyKey,
    metadata = {},
}) => {
    const eventId = `attempt.succeeded:${tenantId}:${idempotencyKey}`;

    try {
        const event = await Event.findOneAndUpdate(
            { eventId },
            {
                $setOnInsert: {
                    eventId,
                    eventType: "attempt.succeeded",
                    tenantId,
                    studentId,
                    attemptId,
                    requestId,
                    occurredAt: new Date(),
                    metadata,
                },
            },
            {
                new: true,
                upsert: true,
            }
        );

        return event;
    } catch (error) {
        console.log("Mongo event error:", error.message);
        throw error;
    }
};

export const createAttemptRejectedEvent = async ({
    tenantId,
    studentId,
    requestId,
    metadata = {},
}) => {
    const eventId = `attempt.rejected:${tenantId}:${requestId}`;

    const event = new Event({
        eventId,
        eventType: "attempt.rejected",
        tenantId,
        studentId,
        requestId,
        occurredAt: new Date(),
        metadata,
    });

    return await event.save();
};