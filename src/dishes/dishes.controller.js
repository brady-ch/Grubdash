const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res, next) => {
  res.json({ data: dishes });
};

const validateDish = (req, res, next) => {
  const {
    data: { id, name, description, price, image_url },
  } = req.body;
  const requiredFields = ["name", "description", "image_url", "price"];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({ status: 400, message: `${field} is missing` });
    }
  }
  if (Number(price) < 1 || typeof price !== "number") {
    return next({ status: 400, message: "price is invalid" });
  }
  res.locals.newDish = { name, description, price, image_url, id };
  return next();
};

const create = (req, res, next) => {
  const newDish = res.locals.newDish;
  const id = nextId();
  res.status(201).json({ data: { ...newDish, id: id } });
};

const dishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => Number(dishId) === Number(dish.id));
  if (foundDish) {
    res.locals.foundDish = foundDish;
    return next();
  }
  return next({
    status: 404,
    message: `Dish with id: ${dishId} does not exist `,
  });
};
//foundDish && newDish
const checkId = (req, res, next) => {
  const { foundDish, newDish } = res.locals;

  if (!(Number(foundDish.id) === Number(newDish.id)) && newDish.id) {
    return next({
      status: 400,
      message: `Dish id does not match the route id. Dish: ${newDish.id}, Route: ${foundDish.id}`,
    });
  }
  return next();
};

const read = (req, res) => {
  const { foundDish } = res.locals;
  res.status(200).json({ data: foundDish });
};

const update = (req, res) => {
  const { newDish, foundDish } = res.locals;
  res.json({ data: { ...newDish, id: foundDish.id } });
};

module.exports = {
  list,
  create: [validateDish, create],
  read: [dishExists, read],
  update: [dishExists, validateDish, checkId, update],
};
