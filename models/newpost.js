var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Newpost(title, introduce, picture, text) {
    this.title = title;
    this.introduce = introduce;
    this.picture = picture;
    this.text = text;
}
module.exports = Newpost;

//存储一篇新闻及其相关信息
Newpost.prototype.save = function(callback) {
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
    var newpost = {
        time: time,
        title: this.title,
        introduce: this.introduce,
        picture: this.picture,
        text: this.text
    };

    //打开数据库
    mongodb.open(function (err, db) {
    if (err) {
        return callback(err);
    }
    //读取 newposts 集合
    db.collection('newposts', function (err, collection) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        //将文档插入 newposts 集合
        collection.insert(newpost, {
            safe: true
        }, function (err, newpost) {
            mongodb.close();
            callback(null);
            });
        });
    });
};


//读取文章及其相关信息
Newpost.get = function(name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
    if (err) {
        return callback(err);
    }
    //读取 newposts 集合
    db.collection('newposts', function(err, collection) {
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


//读取文章及其相关信息
Newpost.getTen = function(name, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 newposts 集合
    db.collection('newposts', function(err, collection) {
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


//删除一条数据
Newpost.removeOne = function(_id, callback) { 
//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 newposts 集合
        db.collection('newposts', function (err, collection) {
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

//读取相关信息(根据id精确获取一个宠物信息)
Newpost.getOne = function(_id, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 newposts 集合
        db.collection('newposts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "_id": new ObjectID(_id)
            }, function (err, newpost) {
                mongodb.close();
                if (newpost) {
                        return callback(null, newpost);//成功！返回查询的宠物信息
                }
                callback(err);//失败！返回 err 信息
            });
        });
    });
};
