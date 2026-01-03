import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [50, "Username must be not longer than 50 characters"],
  },
  company: {
    type: String,
    minlength: [3, "Company name must be at least 3 characters long"],
    maxlength: [50, "Company name must be not longer than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: [true, "Email is being used by another user"],
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
});

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

const User = model("User", UserSchema);
export default User;
