var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Apply(username, petid, state) {
    this.username = username;
    this.petid = petid;
    this.state = state;
}
module.exports = Apply;
//存储一篇文章及其相关信息


Apply.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth()+1),
        day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    }
    //要存入数据库的文档
    var apply = {
        time: time,
        username: this.username,
        petid: this.petid,
        state: this.state
    };
    //打开数据库
    mongodb.open(function (err, db) {
    if (err) {
        return callback(err);
    }
    //读取 applys 集合
    db.collection('applys', function (err, collection) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        //将文档插入 applys 集合
        collection.insert(apply, {
            safe: true
        }, function (err, apply) {
            mongodb.close();
            callback(null);
            });
        });
    });
};


//读取信息
Apply.get = function(name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
    if (err) {
        return callback(err);
    }

    var query = {};
    if (name) {
        query.username = name;
    }

    //读取 applys 集合
    db.collection('applys', function(err, collection) {
    if (err) {
        mongodb.close();
        return callback(err);
    }
    //根据 query 对象查询文章
    collection.find(query).sort({
        time: -1
    }).toArray(function (err, applys) {
        mongodb.close();
        if (err) {
        return callback(err);//失败！返回 err
        }
        callback(null, applys);//成功！以数组形式返回查询的结果
            });
        });
    });
};


//读取相关信息(根据传入的信息，精确获取数据)
Apply.getOne = function(petid, username, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        var obj = {
            petid: petid,
            username: username
        }
        //读取 applys 集合
        db.collection('applys', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.find(obj).sort({
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

//删除一条数据
Apply.removeOne = function(_id, callback) { 
//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 applys 集合
        db.collection('applys', function (err, collection) {
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


//读取文章及其相关信息
Apply.getTen = function(name, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 applys 集合
    db.collection('applys', function(err, collection) {
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
		//根据 query 对象查询，并跳过前 (page-1)*8 个结果，返回之后的 8 个结果
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


//更新一条数据
Apply.updateOne = function(obj1, obj, callback) { 
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 applys 集合
        db.collection('applys', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //更新宠物信息
            collection.update(obj1, {$set: obj}, true, function (err, collection) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};