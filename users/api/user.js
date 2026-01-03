import { createUser } from "../services/index.js";

async function addUser(req, res) {
  const username = req.body.name;
  const company = req.body.company;
  const email = req.body.email;

  if (!username) {
    return res
      .status(400)
      .send({ message: "Missing 'name' in request parameters." });
  }

  if (!email) {
    return res
      .status(400)
      .send({ message: "Missing 'email' in request parameters." });
  }

  createUser(username, company, email)
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      console.error("Error creating user:", error);

      if (error.statusCode) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: error.message,
        });
      }

      res.status(500).json({
        message: "We couldn't add the user right now. Please try again later.",
      });
    });
}

export { addUser };
