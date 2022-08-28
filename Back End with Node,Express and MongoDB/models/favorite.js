const { Mongoose } = require('mongoose');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const favoriteSchema=new Schema({

    user: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
     },
     dishes: [{
       type: Schema.Types.ObjectId,
       ref: 'Dish'
     }]
  },
  {
      timestamps:true
});

var Favorites=mongoose.model('favorite',favoriteSchema);

module.exports=Favorites;