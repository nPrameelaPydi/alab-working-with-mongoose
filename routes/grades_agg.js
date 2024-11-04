import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * It is not best practice to seperate these routes
 * like we have done here. This file was created
 * specifically for educational purposes, to contain
 * all aggregation routes in one place.
 */

/**
 * Grading Weights by Score Type:
 * - Exams: 50%
 * - Quizes: 30%
 * - Homework: 20%
 */

async function createIndexes() {
    const collection = db.collection("grades");

    // Create a single-field index on class_id
    await collection.createIndex({ class_id: 1 });

    // Create a single-field index on learner_id
    await collection.createIndex({ learner_id: 1 });

    // Create a compound index on learner_id and class_id
    await collection.createIndex({ learner_id: 1, class_id: 1 });

    console.log("Indexes created successfully");
}
// Call the function to create indexes
createIndexes().catch(console.error);


// Get the weighted average of a specified learner's grades, per class
router.get("/learner/:id/avg-class", async (req, res) => {
    let collection = await db.collection("grades");

    let result = await collection
        .aggregate([
            {
                $match: { learner_id: Number(req.params.id) },
            },
            {
                $unwind: { path: "$scores" },
            },
            {
                $group: {
                    _id: "$class_id",
                    quiz: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "quiz"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                    exam: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "exam"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                    homework: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "homework"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    class_id: "$_id",
                    avg: {
                        $sum: [
                            { $multiply: [{ $avg: "$exam" }, 0.5] },
                            { $multiply: [{ $avg: "$quiz" }, 0.3] },
                            { $multiply: [{ $avg: "$homework" }, 0.2] },
                        ],
                    },
                },
            },
        ])
        .toArray();

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

export default router;