import jwt from "jsonwebtoken";
import { validateTokenParams } from "../services/tokens.js";
import { readUserByName } from "../services/users.js";

const key = "Never gonna give you up";

const getCaller = async (req) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    // Verify the token is valid
    const data = jwt.verify(token, key);
    return data.username;
  } catch (err) {
    return res.status(401).send("Token required"); // NOTICE THE SEND
  }
};

const isLoggedIn = async (req, res, next) => {
  // If the request has an authorization header
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      // Verify the token is valid
      const data = jwt.verify(token, key);
      // console.log("The logged in user is: " + data.username);
      if (!(await readUserByName(data.username))) {
        return res.status(401).send("Unauthorized"); // NOTICE THE SEND
      }

      return next();
    } catch (err) {
      return res.status(401).send("Token required"); // NOTICE THE SEND
    }
  } else return res.status(401).send("Token required"); // NOTICE THE SEND
};

const getToken = async (req, res) => {
  // Check credentials
  try {
    if (await validateTokenParams(req.body.username, req.body.password)) {
      const data = { username: req.body.username };
      const token = jwt.sign(data, key);
      res.status(200).send(token);
    } else res.status(404).send("Incorrect username and/or password"); // NOTICE THE SEND
  } catch (error) {
    res.status(500).send("wrong parameters");
  }
};

export { isLoggedIn, getToken, getCaller };
