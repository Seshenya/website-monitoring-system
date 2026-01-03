import { User } from "../../models/index.js";

async function createUser(username, company, email) {
  try {
    if (!username || !email) {
      const err = new Error("username and email are required");
      err.statusCode = 400;
      throw err;
    }

    const user = await User.create({
      username,
      company,
      email,
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error.message);
    if (error.code === 11000) {
      const err = new Error("Email already exists");
      err.statusCode = 409;
      throw err;
    }

    throw error;
  }
}

async function getUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error(`No user found for user id: ${userId}`);
  }

  return user;
}

export { createUser, getUser };
