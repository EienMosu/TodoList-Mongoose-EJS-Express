const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true , useUnifiedTopology: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist."
});
const item2 = new Item ({
  name: "Hit to + button for add to item."
});
const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, items){

    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err){

      if (err) {
        console.log(err);
      } else {
        console.log("Success!");
      }
    });

      res.redirect("/");

    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function(err, foundList) {
      foundList.items.push(item)
      foundList.save();

      res.redirect("/" + listName)
    });
  }
});


app.get("/:paramName", function(req, res){
  const paramName = _.capitalize(req.params.paramName);

  List.findOne({name: paramName}, function(err, listName) {    
    if (!err) {
      if (!listName) {
        const list = new List ({
          name: paramName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + paramName)

      } else {
        res.render("list", {listTitle: listName.name, newListItems: listName.items});
      }
    }
  });  
});


app.post("/delete", function(req, res) {
  const itemIdToDelete = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemIdToDelete, function(err){
      if (!err) {
        console.log("Deleted!");
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemIdToDelete}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName)
      }
    });
  }
});


app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server alive on port 3000");
});
