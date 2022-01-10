//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true});

const itemSchema = {
  name : String
};

const Item = mongoose.model("Item", itemSchema);




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

const Work = new Item({
  name: "Do MERN work."
});
const Dsa = new Item({
  name:"Start DSA course"
});
const Exercise = new Item({
  name:"Do a workout"
});

const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

const defaultItems = [Work, Dsa, Exercise];

app.get("/", function(req, res) {
  Item.find({}, function(err, arr){

      if(arr.length === 0){
        Item.insertMany(defaultItems, function(err){
            console.log("Successfully added to list");
            res.redirect("/");
          });
        }
      else{
        res.render("list", {listTitle: "Today", newListItems: arr});

      }
    });
  });




  app.get("/:customListName", function(req, res){
    const customList = _.capitalize(req.params.customListName);

    List.findOne({name: customList}, function(err, foundList){
      if(!err){
        if(!foundList){
          //Create a new list
          const list = new List({
            name: customList,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+ customList);
        }else{
          //Show existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    })




  });



app.post("/", function(req, res){

  const item = req.body.newItem;
  const list = req.body.list;
  const newItem = new Item({
    name:item
  });

  if(list === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:list}, function(err, found){
      found.items.push(newItem);
      found.save();
      res.redirect("/"+list);
    });
  }
});


app.post("/delete", function(req, res){
  const removeId = req.body.checked;
  const title = req.body.title;

    if(title === "Today"){
      Item.findByIdAndRemove(removeId,function(err){
        console.log("successfully removed");
        res.redirect("/");

      });

    }else{
      List.findOneAndUpdate({name: title}, {$pull:{items: {_id: removeId}}}, function(err, foundList){
        if(!err){
          res.redirect("/"+title);
        }
      });
    }

})




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
