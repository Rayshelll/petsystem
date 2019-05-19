var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Pet(pet) {
    this.name = pet.name;
    this.category = pet.category;
    this.age = pet.age;
    this.sex = pet.sex;
    this.area = pet.area;
    this.text = pet.text;
    this.picture = pet.picture;
};

module.exports = Pet;

//存储宠物信息
Pet.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth()+1),
        day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    }
    //要存入数据库的用户文档
    var pet = {
        time: time,
        name: this.name,
        category:this.category,
        age: this.age,
        sex: this.sex,
        area: this.area,
        text: this.text,
        picture: this.picture
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
        return callback(err);//错误，返回 err 信息
        }

    //读取 pets 集合
    db.collection('pets', function (err, collection) {
        if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
        }
    
    //将用户数据插入 pets 集合
        collection.insert(pet, {safe: true}, function (err, pet) {
            mongodb.close();//关闭数据库
            callback(null, pet);//成功！err 为 null，并返回存储后的文档
            });
        });
    });
};

//读取宠物相关信息
Pet.get = function(name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
    //读取 pets 集合
    db.collection('pets', function(err, collection) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
    var query = {};
    if (name) {
        query.name = name;
    }
    //根据 query 对象查询文章
    collection.find(query).sort({
        time: -1
    }).toArray(function (err, docs) {
        mongodb.close();
    if (err) {
        return callback(err);//失败！返回 err
    }
    callback(null, docs);//成功！以数组形式返回查询的结果
        });
    });
});
};

//更新一条数据
Pet.updateOne = function(_id, obj, callback) { 
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 pets 集合
        db.collection('pets', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //更新宠物信息
            collection.update({"_id": new ObjectID(_id)}, {$set: obj}, true, function (err, collection) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};


//读取宠物的相关信息(根据id精确获取一个宠物信息)
Pet.getOne = function(_id, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 pets 集合
        db.collection('pets', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "_id": new ObjectID(_id)
            }, function (err, pet) {
                mongodb.close();
                if (pet) {
                        return callback(null, pet);//成功！返回查询的宠物信息
                }
                callback(err);//失败！返回 err 信息
            });
        });
    });
};

Pet.getTen = function(name, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 pets 集合
    db.collection('pets', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
	  //使用count返回特定查询的文档数
      collection.count(query,function(err,total){
		//根据 query 对象查询，并跳过前 (page-1)*8个结果，返回之后的 8 个结果
		collection.find(query,{
			skip:(page-1)*8,
			limit:8
		}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);//失败！返回 err
				}
				callback(null, docs, total);//成功！以数组形式返回查询的结果
			});
		});
	});
});
};

//删除一条数据
Pet.removeOne = function(_id, callback) { 
//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 pets 集合
        db.collection('pets', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //删除信息
            collection.remove({_id: new ObjectID(_id)}, function (err, collection) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
