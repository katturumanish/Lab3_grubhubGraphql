const graphql = require("graphql");
const _ = require("lodash");
// connect to mongo db
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongo_url = "mongodb+srv://manish:manishmunna@cluster0-nfady.mongodb.net/test?retryWrites=true&w=majority";
mongoose
  .connect(mongo_url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log("DB Connected!"))
  .catch(err => {
    console.log("DB Connection Error:" + err);
  });
//models
const OwnerModel = mongoose.model("owners", {
  name: String,
  zipcode: String,
  restaurant_name: String,
  email: String,
  password: String,
  cuisine: String
});
const MenuModel = mongoose.model("menus", {
  name: String,
  description: String,
  price: String,
  type: String
});

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLDate
} = graphql;

//types
const OwnerType = new GraphQLObjectType({
  name: "Owner",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    zipcode: { type: GraphQLString },
    restaurant_name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    cuisine: { type: GraphQLString }
  })
});

const MenuType = new GraphQLObjectType({
  name: "Menu",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLString },
    type: { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    ownerLogin: {
      type: OwnerType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: async (parent, args) => {
        console.log(args);

        const result = await OwnerModel.findOne({
          email: args.email,
          password: args.password
        });
        console.log(result.toObject());
        if (result == null) {
          return null;
        }
        return result.toObject();
      }
    },
    listMenu: {
      type: GraphQLList(MenuType),
      resolve: (root, args, context, info) => {
        return MenuModel.find().exec();
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createOwners: {
      type: OwnerType,
      args: {
        name: { type: GraphQLString },
        zipcode: { type: GraphQLString },
        restaurant_name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        cuisine: { type: GraphQLString }
      },
      resolve(parent, args) {
        var owner = new OwnerModel(args);
        return owner.save();
      }
    },
    updateOwners: {
      type: OwnerType,
      args: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        zipcode: { type: GraphQLString },
        restaurant_name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        cuisine: { type: GraphQLString }
      },
      resolve(parent, args) {
        var owner = new OwnerModel(args);
        return OwnerModel.findByIdAndUpdate(
          args._id,
          {
            $set: {
              name: args.name,
              zipcode: args.zipcode,
              restaurant_name: args.restaurant_name,
              email: args.email,
              password: args.password,
              cuisine: args.cuisine
            }
          },
          { new: true }
        ).exec();
      }
    },
    addMenu: {
      type: MenuType,
      args: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLString },
        type: { type: GraphQLString }
      },
      resolve(parent, args) {
        var menuItem = new MenuModel(args);
        return menuItem.save();
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

// mutation createOwner ( $name : String!, $zipcode :String!,$restaurant_name : String!,$email : String!,$password : String!,$cuisine : String!){
//     createOwners(name : $name, zipcode : $zipcode, restaurant_name :$restaurant_name, email : $email, password : $password, cuisine : $cuisine){
//   name,
//   zipcode,
//     restaurant_name,
//   email,
//   password,
//   cuisine
//     }
//   }

// {
//     "name" : "Lucy",
//     "zipcode" : "38473",
//      "restaurant_name" : "Panda",
//     "email" : "1233@gmail.com",
//     "password" : "123",
//     "cuisine": "chinese22"
//     }

// {
//     "_id" : "5decb0c133fc8550b86577ea",

//     "name" : "Lucy",
// "zipcode" : "38473",
//  "restaurant_name" : "Panda",
// "email" : "123@gmail.com",
// "password" : "123",
// "cuisine": "chinese22"

// }
// mutation updateOwner ($_id: ID, $name : String!, $zipcode :String!,$restaurant_name : String!,$email : String!,$password : String!,$cuisine : String!){
//     updateOwners(_id : $_id, name : $name, zipcode : $zipcode, restaurant_name :$restaurant_name, email : $email, password : $password, cuisine : $cuisine){
//        _id,
//        name,
//         zipcode,
//         restaurant_name,
//         email,
//         password,
//         cuisine
//     }
//   }

// mutation addMenuItem (  $name : String!, $description :String!,$price : String!, $type: String!){
//     addMenu(name : $name, description : $description, price :$price,type :$type){
//       name,
//       description,
//       price,
//       type
//     }
//   }
// {
//     "name" : "Rice",
// "description" : "white rice",
//  "price" : "$23.4",
//   "type" : "breakfast"
// }
