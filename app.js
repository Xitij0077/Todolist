//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', true);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://admin-Kshitij:<Test123>@clusterone.megr5vc.mongodb.net/todolistDB", {useNewUrlParser: true});
//always remove '<>' from password when error occured
mongoose.connect(
    "mongodb+srv://admin-Kshitij:Test123@clusterzero.lzmiqht.mongodb.net/todolistDB", { useNewUrlParser: true});

    // , useUnifiedTopology: true
// mongodb+srv://admin-Kshitij:<password>@clusterzero.lzmiqht.mongodb.net/?retryWrites=true&w=majority
    // mongodb+srv://admin-Kshitij:<password>@cluster0.7iien8k.mongodb.net/?retryWrites=true&w=majority


// Part 1
const itemsSchema ={
  name:String
};

//Part 2
const Item = mongoose.model("Item", itemsSchema);

//Part 2.1
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the  + button to aff a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

//Part 3
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//part 4


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    }else{
        res.render("list", {listTitle: "Today" , newListItems: foundItems});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err, foundList){
  if(!err){
    if (!foundList){
      // Create a new list console.log("Doesn't exist");
      const list = new List({
      //This Line reflect code on Webpage(Reference to"res.redirect("/"+ customListName);" )//
        name: customListName,
        items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
    } else {
      //Show an existing list console.log("Exist!");
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});



});
//Post on Web Page
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);//Related to line 43
      foundList.save();
      res.redirect("/" + listName);//Related to Line 71
    });
  }

});


//delete from Webpage
app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
