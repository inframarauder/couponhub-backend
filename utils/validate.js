const { BadRequest } = require("./error");

module.exports = (schema, body) => {
  const { error } = schema.validate(body);
  if (error) {
    throw new BadRequest(error.details[0].message);
  } else {
    return true;
  }
};
