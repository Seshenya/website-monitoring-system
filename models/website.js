import mongoose from "mongoose";

import { URL } from "url";
const { Schema, model } = mongoose;

const WebsiteSchema = new Schema({
  url: {
    type: String,
    required: [true, "Website url is required"],
    unique: [true, "This website already exists"],
    trim: true,
    validate: {
      validator: function (website) {
        try {
          new URL(website);
          return true;
        } catch {
          return false;
        }
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  timeDiff: {
    type: Number,
    default: 15 * 60 * 1000, // 15 minutes
  },
  keywords: {
    type: [String],
    default: [], // if no keyword given, all the changes should be considered
    set: (keywords) => keywords.map((k) => k.toLowerCase().trim()),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
});

WebsiteSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Website = model("Website", WebsiteSchema);
export default Website;
