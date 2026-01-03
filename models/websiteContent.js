import mongoose from "mongoose";
const { Schema, model } = mongoose;

const WebsiteContentSchema = new Schema({
  websiteId: {
    type: Schema.Types.ObjectId,
    ref: "Website",
    required: [true, "Website id is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  textContent: {
    type: String,
  },
  statusCode: {
    type: Number,
    required: [true, "Website should have a status code"],
  },
  loadTime: {
    type: Number,
    required: [true, "Website should be loaded"],
  },
});

WebsiteContentSchema.index({ websiteId: 1, createdAt: -1 });

const WebsiteContent = model("WebsiteContent", WebsiteContentSchema);
export default WebsiteContent;
